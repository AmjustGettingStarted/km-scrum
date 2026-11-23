import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { getSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/services/activity.service";
import crypto from "crypto";

const MAX_FILE_SIZE_BYTES = 150 * 1024 * 1024; // 150MB limit

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const taskId = formData.get("taskId") as string;
    const file = formData.get("file") as File | null;

    if (!taskId || !file) {
      return NextResponse.json({ error: "Missing required taskId or file" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File exceeds 150MB limit (Selected: ${(file.size / (1024 * 1024)).toFixed(1)}MB)` },
        { status: 400 }
      );
    }

    // Verify task access
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

    const fileName = file.name;
    const isApk = fileName.toLowerCase().endsWith(".apk");
    const mimeType = isApk
      ? "application/vnd.android.package-archive"
      : file.type || "application/octet-stream";

    // Generate unique sanitized R2 key
    const uniqueSuffix = crypto.randomUUID();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileKey = `tasks/${taskId}/${uniqueSuffix}-${cleanFileName}`;

    // Read file bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload directly to Cloudflare R2
    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileKey,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    // Persist attachment in database
    const attachment = await prisma.attachment.create({
      data: {
        task_id: taskId,
        file_name: fileName,
        file_key: fileKey,
        file_size: BigInt(file.size),
        mime_type: mimeType,
        uploaded_by_id: session.user.id,
      },
      include: {
        uploaded_by: {
          select: { full_name: true },
        },
      },
    });

    await logActivity(prisma, {
      userId: session.user.id,
      activityType: "ATTACHMENT_UPLOADED",
      taskId: taskId,
      description: `Uploaded attachment "${fileName}" (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
      newValue: fileKey,
    });

    return NextResponse.json({
      success: true,
      attachment: {
        id: attachment.id,
        file_name: attachment.file_name,
        file_size: Number(attachment.file_size),
        mime_type: attachment.mime_type,
        created_at: attachment.created_at,
        uploaded_by: attachment.uploaded_by,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload to Cloudflare R2 failed" },
      { status: 500 }
    );
  }
}
