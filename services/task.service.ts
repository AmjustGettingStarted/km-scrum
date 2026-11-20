"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth/session";
import { createTaskSchema, type CreateTaskInput } from "@/lib/validations/task";
import type { TaskPriority, TaskStatus, Prisma } from "@prisma/client";

export interface TaskFilterOptions {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  scheduledDate?: string; // YYYY-MM-DD
  search?: string;
}

export async function getTasksAction(filter?: TaskFilterOptions) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("Not authenticated");

  const whereClause: Prisma.TaskWhereInput = {
    is_archived: false,
  };

  // If user is DEVELOPER, restrict strictly to own assigned tasks
  if (session.user.role === "DEVELOPER") {
    whereClause.assigned_to_id = session.user.id;
  } else if (filter?.assignedToId) {
    whereClause.assigned_to_id = filter.assignedToId;
  }

  if (filter?.status) {
    whereClause.status = filter.status;
  }

  if (filter?.priority) {
    whereClause.priority = filter.priority;
  }

  if (filter?.scheduledDate) {
    whereClause.scheduled_date = new Date(filter.scheduledDate);
  }

  if (filter?.search) {
    whereClause.OR = [
      { title: { contains: filter.search, mode: "insensitive" } },
      { task_code: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  return prisma.task.findMany({
    where: whereClause,
    include: {
      assigned_to: {
        select: { id: true, username: true, full_name: true },
      },
      created_by: {
        select: { id: true, username: true, full_name: true },
      },
    },
    orderBy: [
      { order_index: "asc" },
      { created_at: "desc" },
    ],
  });
}

export async function getTaskByIdAction(taskId: string) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("Not authenticated");

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assigned_to: {
        select: { id: true, username: true, full_name: true },
      },
      created_by: {
        select: { id: true, username: true, full_name: true },
      },
      status_history: {
        include: {
          changed_by: {
            select: { id: true, username: true, full_name: true },
          },
        },
        orderBy: { created_at: "desc" },
      },
      attachments: {
        include: {
          uploaded_by: {
            select: { id: true, full_name: true },
          },
        },
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!task) return null;

  // Authorization check: Developer can only view assigned task
  if (session.user.role === "DEVELOPER" && task.assigned_to_id !== session.user.id) {
    throw new Error("Forbidden: You can only view tasks assigned to you");
  }

  return task;
}

export async function createTaskAction(
  prevState: { success: boolean; error?: string } | null,
  formData: FormData
) {
  const session = await getSessionFromCookies();
  if (!session) return { success: false, error: "Not authenticated" };

  if (session.user.role === "DEVELOPER") {
    return { success: false, error: "Only Scrum Masters and Managers can create tasks" };
  }

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    assignedToId: formData.get("assignedToId") || null,
    priority: formData.get("priority") || "MEDIUM",
    scheduledDate: formData.get("scheduledDate"),
    dueDate: formData.get("dueDate") || null,
  };

  const parsed = createTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Count existing tasks to generate sequential code (or timestamp fallback in development)
  const taskCount = await prisma.task.count();
  const taskCode = `KM-${101 + taskCount}`;

  await prisma.task.create({
    data: {
      task_code: taskCode,
      title: parsed.data.title,
      description: parsed.data.description,
      assigned_to_id: parsed.data.assignedToId || null,
      created_by_id: session.user.id,
      priority: parsed.data.priority,
      status: "TO_DO",
      scheduled_date: new Date(parsed.data.scheduledDate),
      due_date: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      order_index: (taskCount + 1) * 1000.0,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/planning/daily");
  return { success: true };
}

export async function updateTaskAction(
  taskId: string,
  data: Partial<CreateTaskInput>
) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("Not authenticated");

  if (session.user.role === "DEVELOPER") {
    throw new Error("Only Scrum Masters and Managers can edit task details");
  }

  const updateData: Prisma.TaskUpdateInput = {};
  if (data.title) updateData.title = data.title;
  if (data.description) updateData.description = data.description;
  if (data.priority) updateData.priority = data.priority;
  if (data.scheduledDate) updateData.scheduled_date = new Date(data.scheduledDate);
  if (data.dueDate !== undefined) {
    updateData.due_date = data.dueDate ? new Date(data.dueDate) : null;
  }
  if (data.assignedToId !== undefined) {
    updateData.assigned_to = data.assignedToId
      ? { connect: { id: data.assignedToId } }
      : { disconnect: true };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: updateData,
  });

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
  return { success: true };
}

export async function archiveTaskAction(taskId: string) {
  const session = await getSessionFromCookies();
  if (!session || session.user.role !== "MANAGER") {
    throw new Error("Unauthorized: Only Managers can archive tasks");
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { is_archived: true },
  });

  revalidatePath("/tasks");
  return { success: true };
}

export async function reorderTaskAction(taskId: string, newOrderIndex: number) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("Not authenticated");

  await prisma.task.update({
    where: { id: taskId },
    data: { order_index: newOrderIndex },
  });

  revalidatePath("/tasks");
  return { success: true };
}
