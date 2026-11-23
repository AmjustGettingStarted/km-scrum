"use server";

import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth/session";
import type { Prisma } from "@prisma/client";

export interface LogActivityParams {
  userId: string;
  activityType: string;
  taskId?: string | null;
  requestId?: string | null;
  description: string;
  previousValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
  ipAddress?: string | null;
}

export async function logActivity(
  tx: Prisma.TransactionClient | typeof prisma,
  params: LogActivityParams
) {
  try {
    return await tx.activityLog.create({
      data: {
        user_id: params.userId,
        activity_type: params.activityType,
        task_id: params.taskId ?? null,
        request_id: params.requestId ?? null,
        description: params.description,
        previous_value: params.previousValue ?? null,
        new_value: params.newValue ?? null,
        reason: params.reason ?? null,
        ip_address: params.ipAddress ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to write activity log:", err);
    return null;
  }
}

export interface ActivityFilterOptions {
  userId?: string;
  activityType?: string;
  dateStr?: string;
  search?: string;
  limit?: number;
}

export async function getActivityLogsAction(filters?: ActivityFilterOptions) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("Not authenticated");

  const whereClause: Prisma.ActivityLogWhereInput = {};

  // If DEVELOPER: restricted strictly to own activity
  if (session.user.role === "DEVELOPER") {
    whereClause.user_id = session.user.id;
  } else if (filters?.userId && filters.userId !== "ALL") {
    whereClause.user_id = filters.userId;
  }

  if (filters?.activityType && filters.activityType !== "ALL") {
    // Support category grouping or exact type
    if (filters.activityType === "TASKS") {
      whereClause.activity_type = {
        in: ["TASK_CREATED", "TASK_STATUS_CHANGED", "TASK_UPDATED", "TASK_REASSIGNED", "TASK_PRIORITY_CHANGED", "TASK_ARCHIVED"],
      };
    } else if (filters.activityType === "FILES") {
      whereClause.activity_type = { in: ["ATTACHMENT_UPLOADED", "TASK_UPDATED"] };
    } else if (filters.activityType === "REQUESTS") {
      whereClause.activity_type = {
        in: ["LEAVE_REQUESTED", "COMPLAINT_FILED", "TICKET_RAISED", "REQUEST_REVIEWED"],
      };
    } else if (filters.activityType === "USERS") {
      whereClause.activity_type = {
        in: ["USER_CREATED", "USER_STATUS_CHANGED", "PASSWORD_RESET"],
      };
    } else if (filters.activityType === "AUTH") {
      whereClause.activity_type = {
        in: ["USER_LOGGED_IN", "USER_LOGGED_OUT", "PASSWORD_CHANGED"],
      };
    } else {
      whereClause.activity_type = filters.activityType;
    }
  }

  if (filters?.dateStr) {
    const start = new Date(filters.dateStr);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.dateStr);
    end.setHours(23, 59, 59, 999);

    whereClause.created_at = {
      gte: start,
      lte: end,
    };
  }

  if (filters?.search && filters.search.trim()) {
    const term = filters.search.trim();
    whereClause.OR = [
      { description: { contains: term, mode: "insensitive" } },
      { reason: { contains: term, mode: "insensitive" } },
      { task: { task_code: { contains: term, mode: "insensitive" } } },
      { task: { title: { contains: term, mode: "insensitive" } } },
      { request: { request_code: { contains: term, mode: "insensitive" } } },
      { request: { subject: { contains: term, mode: "insensitive" } } },
      { user: { full_name: { contains: term, mode: "insensitive" } } },
      { user: { username: { contains: term, mode: "insensitive" } } },
    ];
  }

  return prisma.activityLog.findMany({
    where: whereClause,
    include: {
      user: {
        select: { id: true, username: true, full_name: true, role: true },
      },
      task: {
        select: { id: true, task_code: true, title: true },
      },
      request: {
        select: { id: true, request_code: true, subject: true, category: true },
      },
    },
    orderBy: { created_at: "desc" },
    take: filters?.limit || 200,
  });
}
