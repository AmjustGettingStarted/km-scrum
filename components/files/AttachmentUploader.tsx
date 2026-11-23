"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileIcon, AlertCircle, Download, FileArchive, Film, Image as ImageIcon } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const formData = new FormData();
    formData.append("taskId", taskId);
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/files/upload", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(null), 1200);

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.success && res.attachment) {
            setAttachments((prev) => [res.attachment, ...prev]);
            if (fileInputRef.current) fileInputRef.current.value = "";
          } else {
            setError(res.error || "Upload failed");
          }
        } catch {
          setError("Upload completed but server response was invalid");
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          setError(errRes.error || `Upload failed (Status: ${xhr.status})`);
        } catch {
          setError(`Upload failed with status code ${xhr.status}`);
        }
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setUploadProgress(null);
      setError("Network error occurred during upload. Check connection.");
    };

    xhr.send(formData);
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
        <div className="p-3 rounded-inputs bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
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
