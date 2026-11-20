"use client";

import { useState, useRef } from "react";
import { confirmAttachmentAction } from "@/services/storage.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileIcon, CheckCircle2, AlertCircle, Download, FileArchive } from "lucide-react";

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError("File exceeds 50MB limit");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setError(null);

    try {
      // 1. Request presigned upload URL from server
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
        const errJson = await presignRes.json();
        throw new Error(errJson.error || "Failed to generate upload URL");
      }

      const { uploadUrl, fileKey } = await presignRes.json();
      setUploadProgress(40);

      // 2. Direct HTTP PUT upload to Cloudflare R2
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!putRes.ok) {
        throw new Error("Direct Cloudflare R2 upload failed");
      }

      setUploadProgress(85);

      // 3. Confirm attachment in PostgreSQL
      await confirmAttachmentAction({
        taskId,
        fileName: file.name,
        fileKey,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      });

      setUploadProgress(100);
      setAttachments((prev) => [
        {
          id: fileKey,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type || "application/octet-stream",
          created_at: new Date(),
        },
        ...prev,
      ]);

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload error");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(null), 1500);
    }
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
          Upload Attachment (Images, Videos, APK, Logs)
        </span>
        <span className="text-[11px] text-fog block mt-0.5">
          Max file size: 50MB &bull; Presigned direct upload to R2
        </span>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
      </div>

      {isUploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-steel">
            <span>Uploading to Cloudflare R2...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-ash rounded-full overflow-hidden">
            <div
              className="h-full bg-electric-blue transition-all duration-300"
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
          attachments.map((file) => {
            const isApk = file.file_name.toLowerCase().endsWith(".apk");

            return (
              <div
                key={file.id}
                className="flex items-center justify-between p-2.5 rounded-cards border border-ash bg-canvas-white hover:bg-paper-mist/30 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  {isApk ? (
                    <FileArchive className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <FileIcon className="w-4 h-4 text-steel shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="font-medium text-charcoal block truncate">
                      {file.file_name}
                    </span>
                    <span className="text-[10px] text-fog block">
                      {formatFileSize(file.file_size)}
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
            );
          })
        )}
      </div>
    </div>
  );
}
