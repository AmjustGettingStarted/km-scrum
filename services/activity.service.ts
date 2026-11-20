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
  return tx.activityLog.create({
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
}

export interface ActivityFilterOptions {
  userId?: string;
  activityType?: string;
  dateStr?: string;
  search?: string;
}

export async function getActivityLogsAction(filters?: ActivityFilterOptions) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("Not authenticated");

  const whereClause: Prisma.ActivityLogWhereInput = {};

  // If DEVELOPER: restricted strictly to own activity
  if (session.user.role === "DEVELOPER") {
    whereClause.user_id = session.user.id;
  } else if (filters?.userId) {
    whereClause.user_id = filters.userId;
  }

  if (filters?.activityType) {
    whereClause.activity_type = filters.activityType;
  }

  if (filters?.dateStr) {
    const start = new Date(filters.dateStr);
    const end = new Date(filters.dateStr);
    end.setDate(end.getDate() + 1);

    whereClause.created_at = {
      gte: start,
      lt: end,
    };
  }

  if (filters?.search) {
    whereClause.description = {
      contains: filters.search,
      mode: "insensitive",
    };
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
        select: { id: true, request_code: true, subject: true },
      },
    },
    orderBy: { created_at: "desc" },
    take: 100, // pagination limit
  });
}
