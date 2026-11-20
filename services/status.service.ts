"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth/session";
import { transitionStatusSchema, type TransitionStatusInput } from "@/lib/validations/task";
import type { TaskStatus } from "@prisma/client";

export async function transitionTaskStatusAction(input: TransitionStatusInput) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("Not authenticated");

  const parsed = transitionStatusSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { taskId, newStatus, reason } = parsed.data;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) throw new Error("Task not found");
  if (task.status === newStatus) {
    return { success: true, message: "Status already set" };
  }

  // RBAC Transition Checks
  if (session.user.role === "DEVELOPER") {
    // 1. Must be assigned to this developer
    if (task.assigned_to_id !== session.user.id) {
      throw new Error("Forbidden: You can only transition status of tasks assigned to you");
    }

    // 2. Developer cannot mark task as RELEASED or COMPLETED
    if (newStatus === "RELEASED" || newStatus === "COMPLETED") {
      throw new Error(
        "Forbidden: Marking tasks as Released or Completed requires Scrum Master or Manager approval"
      );
    }
  }

  // Atomic database transaction: Update Task + Insert TaskStatusHistory
  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    });

    await tx.taskStatusHistory.create({
      data: {
        task_id: taskId,
        previous_status: task.status,
        new_status: newStatus,
        changed_by_id: session.user.id,
        reason: reason,
      },
    });
  });

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/planning/daily");

  return { success: true };
}
