"use client";

import { useState, useRef } from "react";
import { confirmAttachmentAction } from "@/services/storage.service";
import { Button } from "@/components/ui/button";
import { Upload, FileIcon, AlertCircle, Download, FileArchive, Film, Image as ImageIcon, ExternalLink, HelpCircle } from "lucide-react";

interface AttachmentItem {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: Date | string;
  uploaded_by?: { full_name: string };
}

interface AttachmentUploaderProps {
  taskId: string;
  initialAttachments?: AttachmentItem[];
}

const MAX_FILE_SIZE_BYTES = 150 * 1024 * 1024; // 150MB

export function AttachmentUploader({ taskId, initialAttachments = [] }: AttachmentUploaderProps) {
  const [attachments, setAttachments] = useState<AttachmentItem[]>(initialAttachments);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [corsHelp, setCorsHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const uploadViaServer = async (file: File): Promise<AttachmentItem> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("taskId", taskId);
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/files/upload", true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success && data.attachment) {
              resolve(data.attachment);
            } else {
              reject(new Error(data.error || "Server upload failed"));
            }
          } catch {
            reject(new Error("Invalid response from upload server"));
          }
        } else if (xhr.status === 413) {
          reject(new Error("File exceeds tunnel proxy limit (16MB). Direct Cloudflare R2 upload required."));
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            reject(new Error(errData.error || `Server returned ${xhr.status}`));
          } catch {
            reject(new Error(`Server upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error during server upload"));
      };

      xhr.send(formData);
    });
  };

  const uploadViaPresignedR2 = async (file: File): Promise<AttachmentItem> => {
    // 1. Get presigned upload URL
    const presignRes = await fetch("/api/files/presign-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId,
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
      }),
    });

    if (!presignRes.ok) {
      const err = await presignRes.json().catch(() => ({}));
      throw new Error(err.error || `Failed to generate upload URL (${presignRes.status})`);
    }

    const { uploadUrl, fileKey } = await presignRes.json();

    // 2. Direct upload to Cloudflare R2
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            // 3. Confirm attachment in database
            const confirmRes = await confirmAttachmentAction({
              taskId,
              fileName: file.name,
              fileKey,
              fileSize: file.size,
              mimeType: file.type || "application/octet-stream",
            });

            if (confirmRes.success && confirmRes.attachment) {
              resolve(confirmRes.attachment);
            } else {
              reject(new Error("Failed to save attachment metadata"));
            }
          } catch (e: any) {
            reject(new Error(e.message || "Failed to confirm upload"));
          }
        } else {
          reject(new Error(`Cloudflare R2 rejected upload with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        // Status 0 on cross-origin upload is almost always a CORS error
        const isCors = xhr.status === 0;
        if (isCors) {
          const err = new Error("CORS_BLOCKED");
          (err as any).isCors = true;
          reject(err);
        } else {
          reject(new Error("Direct R2 upload connection failed"));
        }
      };

      xhr.send(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File exceeds 150MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB selected)`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setCorsHelp(false);

    try {
      let uploadedAttachment: AttachmentItem;

      // Strategy:
      // For files under 15MB: use /api/files/upload directly (seamless, zero CORS setup needed).
      // For files over 15MB (e.g. 115MB APK): use Direct Presigned R2 upload (bypasses DevTunnel 16MB and Vercel 4.5MB limits).
      if (file.size <= 15 * 1024 * 1024) {
        try {
          uploadedAttachment = await uploadViaServer(file);
        } catch {
          uploadedAttachment = await uploadViaPresignedR2(file);
        }
      } else {
        try {
          uploadedAttachment = await uploadViaPresignedR2(file);
        } catch (r2Err: any) {
          if (r2Err.message === "CORS_BLOCKED" || r2Err.isCors) {
            setCorsHelp(true);
            throw new Error(
              `Upload of ${(file.size / (1024 * 1024)).toFixed(1)}MB APK/file requires Cloudflare R2 CORS Policy to be enabled on bucket "km-scrum-attachments".`
            );
          }
          throw r2Err;
        }
      }

      setAttachments((prev) => [uploadedAttachment, ...prev]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(null), 1200);
    }
  };

  const getFileIcon = (fileName: string, mimeType: string) => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith(".apk") || mimeType.includes("android")) {
      return <FileArchive className="w-4 h-4 text-emerald-600 shrink-0" />;
    }
    if (mimeType.startsWith("video/") || lowerName.endsWith(".mp4") || lowerName.endsWith(".webm") || lowerName.endsWith(".mov")) {
      return <Film className="w-4 h-4 text-purple-600 shrink-0" />;
    }
    if (mimeType.startsWith("image/") || lowerName.endsWith(".png") || lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || lowerName.endsWith(".webp") || lowerName.endsWith(".gif")) {
      return <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />;
    }
    return <FileIcon className="w-4 h-4 text-steel shrink-0" />;
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-inputs bg-red-50 border border-red-200 text-red-800 text-xs flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>

          {corsHelp && (
            <div className="mt-2 p-3 bg-white rounded-inputs border border-red-200 text-charcoal text-[11px] space-y-2">
              <div className="font-semibold text-charcoal flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-electric-blue" />
                How to enable CORS in Cloudflare Dashboard (1 minute fix):
              </div>
              <ol className="list-decimal pl-4 space-y-1 text-steel">
                <li>Go to <strong>Cloudflare Dashboard &gt; R2</strong> and click bucket <strong>km-scrum-attachments</strong>.</li>
                <li>Click the <strong>Settings</strong> tab and scroll to <strong>CORS Policy</strong>.</li>
                <li>Click <strong>Add CORS Policy</strong> and paste this configuration:</li>
              </ol>
              <pre className="p-2 bg-paper-mist rounded text-[10px] font-mono text-charcoal overflow-x-auto border border-ash select-all">
{`[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]`}
              </pre>
              <p className="text-[10px] text-fog">
                Once saved, your browser can upload files up to 150MB directly to Cloudflare R2 at full speed without hitting tunnel or server limits!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Upload trigger card */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border border-dashed border-ash hover:border-charcoal/40 rounded-cards p-4 bg-paper-mist/30 text-center cursor-pointer transition-colors"
      >
        <Upload className="w-5 h-5 mx-auto text-steel mb-1.5" />
        <span className="text-xs font-medium text-charcoal block">
          Upload Attachment (Images, Screenshots, Videos, APK, Logs)
        </span>
        <span className="text-[11px] text-fog block mt-0.5">
          Max file size: 150MB &bull; Stored securely on Cloudflare R2
        </span>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading}
          accept="image/*,video/*,.apk,application/vnd.android.package-archive,application/pdf,.zip,.txt,.log"
        />
      </div>

      {isUploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-steel">
            <span>Uploading to Cloudflare R2...</span>
            <span>{uploadProgress ?? 0}%</span>
          </div>
          <div className="w-full h-1.5 bg-ash rounded-full overflow-hidden">
            <div
              className="h-full bg-electric-blue transition-all duration-200"
              style={{ width: `${uploadProgress ?? 0}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Attachments List */}
      <div className="space-y-2">
        {attachments.length === 0 ? (
          <p className="text-xs text-fog italic py-2">No attachments uploaded yet.</p>
        ) : (
          attachments.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2.5 rounded-cards border border-ash bg-canvas-white hover:bg-paper-mist/30 transition-colors text-xs"
            >
              <div className="flex items-center gap-2.5 truncate">
                {getFileIcon(file.file_name, file.mime_type)}
                <div className="truncate">
                  <span className="font-medium text-charcoal block truncate">
                    {file.file_name}
                  </span>
                  <span className="text-[10px] text-fog block">
                    {formatFileSize(file.file_size)} &bull; {new Date(file.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <a
                href={`/api/files/download/${file.id}`}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-electric-blue hover:underline shrink-0 ml-3 cursor-pointer"
                download
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
