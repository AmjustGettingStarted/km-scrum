"use server";

import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth/session";
import type { TaskPriority, TaskStatus } from "@prisma/client";

export interface DeveloperWorkloadItem {
  developer: {
    id: string;
    username: string;
    full_name: string;
  };
  tasks: {
    id: string;
    task_code: string;
    title: string;
    priority: TaskPriority;
    status: TaskStatus;
    due_date: Date | null;
    isOverdue: boolean;
  }[];
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  testingTasks: number;
  isOverloaded: boolean;
  hasNoTasks: boolean;
  isOnLeave: boolean;
  leaveType?: string | null;
}

export async function getDailyPlanningDataAction(dateStr?: string) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("Not authenticated");

  const targetDateStr = dateStr || new Date().toISOString().split("T")[0];
  const targetDate = new Date(targetDateStr);

  const now = new Date();

  // If DEVELOPER: only return developer's own tasks for that date
  if (session.user.role === "DEVELOPER") {
    const tasks = await prisma.task.findMany({
      where: {
        assigned_to_id: session.user.id,
        scheduled_date: targetDate,
        is_archived: false,
      },
      include: {
        created_by: { select: { full_name: true } },
      },
      orderBy: { priority: "asc" },
    });

    const tasksWithOverdue = tasks.map((t) => ({
      ...t,
      isOverdue:
        Boolean(t.due_date && t.due_date < now && t.status !== "COMPLETED" && t.status !== "RELEASED"),
    }));

    return {
      role: "DEVELOPER" as const,
      selectedDate: targetDateStr,
      tasks: tasksWithOverdue,
      metrics: {
        total: tasks.length,
        completed: tasks.filter((t) => t.status === "COMPLETED" || t.status === "RELEASED").length,
        inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
        pending: tasks.filter((t) => t.status === "PENDING").length,
        testing: tasks.filter((t) => t.status === "TESTING").length,
        overdue: tasksWithOverdue.filter((t) => t.isOverdue).length,
      },
    };
  }

  // If SCRUM_MASTER or MANAGER: return team-wide breakdown by developer
  const [activeDevelopers, scheduledTasks] = await Promise.all([
    prisma.user.findMany({
      where: { role: "DEVELOPER", is_active: true },
      select: { id: true, username: true, full_name: true },
      orderBy: { full_name: "asc" },
    }),
    prisma.task.findMany({
      where: {
        scheduled_date: targetDate,
        is_archived: false,
      },
      include: {
        assigned_to: { select: { id: true, username: true, full_name: true } },
      },
      orderBy: { priority: "asc" },
    }),
  ]);

  const workloadByDeveloper: DeveloperWorkloadItem[] = activeDevelopers.map((dev) => {
    const devTasks = scheduledTasks.filter((t) => t.assigned_to_id === dev.id);

    const devTasksWithOverdue = devTasks.map((t) => ({
      id: t.id,
      task_code: t.task_code,
      title: t.title,
      priority: t.priority,
      status: t.status,
      due_date: t.due_date,
      isOverdue: Boolean(
        t.due_date && t.due_date < now && t.status !== "COMPLETED" && t.status !== "RELEASED"
      ),
    }));

    const total = devTasks.length;
    const completed = devTasks.filter((t) => t.status === "COMPLETED" || t.status === "RELEASED").length;
    const inProgress = devTasks.filter((t) => t.status === "IN_PROGRESS").length;
    const pending = devTasks.filter((t) => t.status === "PENDING").length;
    const testing = devTasks.filter((t) => t.status === "TESTING").length;

    return {
      developer: dev,
      tasks: devTasksWithOverdue,
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      pendingTasks: pending,
      testingTasks: testing,
      isOverloaded: total >= 5,
      hasNoTasks: total === 0,
      isOnLeave: false, // will connect with Request model in Phase 8
    };
  });

  const unassignedTasks = scheduledTasks.filter((t) => !t.assigned_to_id);

  return {
    role: session.user.role as "MANAGER" | "SCRUM_MASTER",
    selectedDate: targetDateStr,
    developerWorkload: workloadByDeveloper,
    unassignedTasks,
    summary: {
      totalDevelopers: activeDevelopers.length,
      unassignedDevsCount: workloadByDeveloper.filter((w) => w.hasNoTasks).length,
      overloadedDevsCount: workloadByDeveloper.filter((w) => w.isOverloaded).length,
      totalScheduledTasks: scheduledTasks.length,
    },
  };
}

export async function getMonthlyPlanningDataAction(year: number, month: number) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("Not authenticated");

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const whereClause: {
    scheduled_date: { gte: Date; lte: Date };
    is_archived: boolean;
    assigned_to_id?: string;
  } = {
    scheduled_date: { gte: startDate, lte: endDate },
    is_archived: false,
  };

  if (session.user.role === "DEVELOPER") {
    whereClause.assigned_to_id = session.user.id;
  }

  const tasks = await prisma.task.findMany({
    where: whereClause,
    select: {
      id: true,
      scheduled_date: true,
      status: true,
      priority: true,
    },
  });

  // Group task count by day of month
  const dayCounts: Record<number, number> = {};
  tasks.forEach((t) => {
    const day = new Date(t.scheduled_date).getDate();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });

  return {
    year,
    month,
    daysInMonth: endDate.getDate(),
    dayCounts,
    totalTasks: tasks.length,
  };
}
