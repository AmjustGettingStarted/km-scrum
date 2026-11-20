"use server";

import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth/session";

export async function getDashboardMetricsAction() {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("Not authenticated");

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const todayStart = new Date(todayStr);

  const role = session.user.role;

  if (role === "DEVELOPER") {
    const [assignedTasks, todayTasks, recentTransitions] = await Promise.all([
      prisma.task.findMany({
        where: { assigned_to_id: session.user.id, is_archived: false },
        select: { id: true, status: true, priority: true, due_date: true },
      }),
      prisma.task.findMany({
        where: {
          assigned_to_id: session.user.id,
          scheduled_date: todayStart,
          is_archived: false,
        },
        orderBy: { priority: "asc" },
      }),
      prisma.taskStatusHistory.findMany({
        where: { changed_by_id: session.user.id },
        include: { task: { select: { task_code: true, title: true } } },
        orderBy: { created_at: "desc" },
        take: 5,
      }),
    ]);

    const overdueCount = assignedTasks.filter(
      (t) => t.due_date && t.due_date < today && t.status !== "COMPLETED" && t.status !== "RELEASED"
    ).length;

    return {
      role: "DEVELOPER" as const,
      user: session.user,
      metrics: {
        totalAssigned: assignedTasks.length,
        todayTasksCount: todayTasks.length,
        inProgress: assignedTasks.filter((t) => t.status === "IN_PROGRESS").length,
        pending: assignedTasks.filter((t) => t.status === "PENDING").length,
        testing: assignedTasks.filter((t) => t.status === "TESTING").length,
        completed: assignedTasks.filter((t) => t.status === "COMPLETED" || t.status === "RELEASED").length,
        overdue: overdueCount,
      },
      todayTasks,
      recentTransitions,
    };
  }

  // If SCRUM_MASTER or MANAGER
  const [allTasks, developers, pendingRequests] = await Promise.all([
    prisma.task.findMany({
      where: { is_archived: false },
      include: {
        assigned_to: { select: { id: true, full_name: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "DEVELOPER", is_active: true },
      select: { id: true, full_name: true, username: true },
    }),
    prisma.request.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { full_name: true } } },
      orderBy: { created_at: "desc" },
      take: 5,
    }),
  ]);

  // Status breakdown
  const statusCounts = {
    TO_DO: allTasks.filter((t) => t.status === "TO_DO").length,
    IN_PROGRESS: allTasks.filter((t) => t.status === "IN_PROGRESS").length,
    PENDING: allTasks.filter((t) => t.status === "PENDING").length,
    TESTING: allTasks.filter((t) => t.status === "TESTING").length,
    RELEASED: allTasks.filter((t) => t.status === "RELEASED").length,
    COMPLETED: allTasks.filter((t) => t.status === "COMPLETED").length,
  };

  // Priority breakdown
  const priorityCounts = {
    CRITICAL: allTasks.filter((t) => t.priority === "CRITICAL").length,
    HIGH: allTasks.filter((t) => t.priority === "HIGH").length,
    MEDIUM: allTasks.filter((t) => t.priority === "MEDIUM").length,
    LOW: allTasks.filter((t) => t.priority === "LOW").length,
  };

  // Workload per developer
  const developerWorkload = developers.map((dev) => ({
    name: dev.full_name,
    taskCount: allTasks.filter((t) => t.assigned_to_id === dev.id).length,
  }));

  const overdueTotal = allTasks.filter(
    (t) => t.due_date && t.due_date < today && t.status !== "COMPLETED" && t.status !== "RELEASED"
  ).length;

  return {
    role: role as "SCRUM_MASTER" | "MANAGER",
    user: session.user,
    metrics: {
      totalTasks: allTasks.length,
      activeDevelopers: developers.length,
      testingQueue: statusCounts.TESTING,
      pendingBlockers: statusCounts.PENDING,
      overdueTasks: overdueTotal,
      pendingReviews: pendingRequests.length,
    },
    statusCounts,
    priorityCounts,
    developerWorkload,
    pendingRequests,
  };
}
