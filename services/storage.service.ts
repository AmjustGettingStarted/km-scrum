"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth/session";

export interface ConfirmAttachmentInput {
  taskId: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
}

export async function confirmAttachmentAction(input: ConfirmAttachmentInput) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("Not authenticated");

  const task = await prisma.task.findUnique({
    where: { id: input.taskId },
  });

  if (!task) throw new Error("Task not found");

  if (session.user.role === "DEVELOPER" && task.assigned_to_id !== session.user.id) {
    throw new Error("Forbidden: You can only attach files to your assigned tasks");
  }

  const attachment = await prisma.attachment.create({
    data: {
      task_id: input.taskId,
      file_name: input.fileName,
      file_key: input.fileKey,
      file_size: BigInt(input.fileSize),
      mime_type: input.mimeType,
      uploaded_by_id: session.user.id,
    },
    include: {
      uploaded_by: {
        select: { full_name: true },
      },
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      user_id: session.user.id,
      task_id: input.taskId,
      activity_type: "TASK_UPDATED",
      description: `Uploaded attachment "${input.fileName}" (${(input.fileSize / (1024 * 1024)).toFixed(1)} MB)`,
    },
  }).catch(() => {});

  revalidatePath(`/tasks/${input.taskId}`);
  return {
    success: true,
    attachment: {
      id: attachment.id,
      file_name: attachment.file_name,
      file_size: Number(attachment.file_size),
      mime_type: attachment.mime_type,
      created_at: attachment.created_at,
      uploaded_by: attachment.uploaded_by,
    },
  };
}

export async function getTaskAttachmentsAction(taskId: string) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("Not authenticated");

  const attachments = await prisma.attachment.findMany({
    where: { task_id: taskId },
    include: {
      uploaded_by: {
        select: { id: true, full_name: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return attachments.map((a) => ({
    ...a,
    file_size: Number(a.file_size),
  }));
}
