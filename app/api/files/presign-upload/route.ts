import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { getSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const MAX_FILE_SIZE_BYTES = 150 * 1024 * 1024; // 150MB limit

const ALLOWED_MIME_TYPES = new Set([
  // Images
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",
  // Android APK build
  "application/vnd.android.package-archive",
  "application/octet-stream", // Fallback for some browsers on APK
  // Documents
  "application/pdf",
  "text/plain",
  "application/zip",
]);

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, fileName, fileType, fileSize } = body;

    if (!taskId || !fileName || !fileType || !fileSize) {
      return NextResponse.json({ error: "Missing required file metadata" }, { status: 400 });
    }

    if (fileSize > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 150MB limit" },
        { status: 400 }
      );
    }

    // Check MIME type whitelist
    const isApkByName = fileName.toLowerCase().endsWith(".apk");
    if (!ALLOWED_MIME_TYPES.has(fileType) && !isApkByName) {
      return NextResponse.json(
        { error: `File type ${fileType} is not permitted` },
        { status: 400 }
      );
    }

    // Check task access
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, assigned_to_id: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (session.user.role === "DEVELOPER" && task.assigned_to_id !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only upload files to tasks assigned to you" },
        { status: 403 }
      );
    }

    // Generate unique sanitized R2 object key
    const uniqueSuffix = crypto.randomUUID();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileKey = `tasks/${taskId}/${uniqueSuffix}-${cleanFileName}`;

    // Create Presigned PUT URL valid for 15 minutes
    const putCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: isApkByName ? "application/vnd.android.package-archive" : fileType,
    });

    const uploadUrl = await getSignedUrl(r2, putCommand, { expiresIn: 900 });

    return NextResponse.json({
      uploadUrl,
      fileKey,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Presign upload failed" },
      { status: 500 }
    );
  }
}
