"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth/session";

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  link?: string,
  type = "SYSTEM"
) {
  return prisma.notification.create({
    data: {
      user_id: userId,
      title,
      message,
      link,
      type,
    },
  });
}

export async function getNotificationsAction() {
  const session = await getSessionFromCookies();
  if (!session) return [];

  return prisma.notification.findMany({
    where: { user_id: session.user.id },
    orderBy: { created_at: "desc" },
    take: 10,
  });
}

export async function markNotificationAsReadAction(notificationId: string) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("Not authenticated");

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      user_id: session.user.id,
    },
    data: { is_read: true },
  });

  revalidatePath("/");
  return { success: true };
}
