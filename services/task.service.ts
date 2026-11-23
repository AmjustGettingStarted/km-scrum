"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth/session";
import { logActivity } from "@/services/activity.service";
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
      { order_index: "desc" },
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

  let assignedToId = parsed.data.assignedToId || null;
  if (session.user.role === "DEVELOPER") {
    // Developers can create their own tasks; force assignment to themselves
    assignedToId = session.user.id;
  }

  // Count existing tasks to generate sequential code
  const taskCount = await prisma.task.count();
  const taskCode = `KM-${101 + taskCount}`;

  // Find max order_index so the newest task always lands at the very top
  const maxTask = await prisma.task.findFirst({
    orderBy: { order_index: "desc" },
    select: { order_index: true },
  });
  const newOrderIndex = maxTask ? (maxTask.order_index ?? 0) + 1000.0 : 1000.0;

  const createdTask = await prisma.task.create({
    data: {
      task_code: taskCode,
      title: parsed.data.title,
      description: parsed.data.description,
      assigned_to_id: assignedToId,
      created_by_id: session.user.id,
      priority: parsed.data.priority,
      status: "TO_DO",
      scheduled_date: new Date(parsed.data.scheduledDate),
      due_date: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      order_index: newOrderIndex,
    },
    include: {
      assigned_to: { select: { full_name: true } },
    },
  });

  await logActivity(prisma, {
    userId: session.user.id,
    activityType: "TASK_CREATED",
    taskId: createdTask.id,
    description: `Created task ${taskCode}: "${parsed.data.title}"`,
    newValue: JSON.stringify({
      priority: parsed.data.priority,
      assignedTo: createdTask.assigned_to?.full_name || "Unassigned",
      scheduledDate: parsed.data.scheduledDate,
    }),
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

  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assigned_to: { select: { id: true, full_name: true } },
    },
  });

  if (!existing) throw new Error("Task not found");

  if (session.user.role === "DEVELOPER") {
    if (existing.created_by_id !== session.user.id && existing.assigned_to_id !== session.user.id) {
      throw new Error("Forbidden: You can only edit tasks you created or are assigned to");
    }
    // Developers cannot reassign tasks to others
    delete data.assignedToId;
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

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: {
      assigned_to: { select: { id: true, full_name: true } },
    },
  });

  // Log granular changes
  if (data.priority && data.priority !== existing.priority) {
    await logActivity(prisma, {
      userId: session.user.id,
      activityType: "TASK_PRIORITY_CHANGED",
      taskId,
      description: `Changed priority of ${existing.task_code} from ${existing.priority} to ${data.priority}`,
      previousValue: existing.priority,
      newValue: data.priority,
    });
  }

  if (data.assignedToId !== undefined && data.assignedToId !== existing.assigned_to_id) {
    const prevName = existing.assigned_to?.full_name || "Unassigned";
    const newName = updatedTask.assigned_to?.full_name || "Unassigned";
    await logActivity(prisma, {
      userId: session.user.id,
      activityType: "TASK_REASSIGNED",
      taskId,
      description: `Reassigned ${existing.task_code} from ${prevName} to ${newName}`,
      previousValue: prevName,
      newValue: newName,
    });
  }

  if (data.title || data.description || data.scheduledDate) {
    await logActivity(prisma, {
      userId: session.user.id,
      activityType: "TASK_UPDATED",
      taskId,
      description: `Updated details for ${existing.task_code}: "${data.title || existing.title}"`,
    });
  }

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
  return { success: true };
}

export async function archiveTaskAction(taskId: string) {
  const session = await getSessionFromCookies();
  if (!session || session.user.role !== "MANAGER") {
    throw new Error("Unauthorized: Only Managers can archive tasks");
  }

  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { task_code: true, title: true } });
  await prisma.task.update({
    where: { id: taskId },
    data: { is_archived: true },
  });

  await logActivity(prisma, {
    userId: session.user.id,
    activityType: "TASK_ARCHIVED",
    taskId,
    description: `Archived task ${task?.task_code || taskId}: "${task?.title || ""}"`,
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
