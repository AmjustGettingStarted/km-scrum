"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { createUserSchema, type CreateUserInput } from "@/lib/validations/auth";
import type { UserRole } from "@prisma/client";

function assertManager(role: UserRole) {
  if (role !== "MANAGER") {
    throw new Error("Unauthorized: Only Managers can manage user accounts");
  }
}

export async function getUsersAction() {
  const session = await getSessionFromCookies();
  if (!session || (session.user.role !== "MANAGER" && session.user.role !== "SCRUM_MASTER")) {
    throw new Error("Unauthorized");
  }

  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      full_name: true,
      email: true,
      role: true,
      is_active: true,
      must_change_password: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
  });
}

export async function createUserAction(
  prevState: { success: boolean; error?: string } | null,
  formData: FormData
) {
  const session = await getSessionFromCookies();
  if (!session) return { success: false, error: "Not authenticated" };

  try {
    assertManager(session.user.role);
  } catch (err) {
    return { success: false, error: "Only Managers can create user accounts" };
  }

  const raw = {
    username: formData.get("username"),
    fullName: formData.get("fullName"),
    email: formData.get("email") || undefined,
    role: formData.get("role"),
    temporaryPassword: formData.get("temporaryPassword"),
  };

  const parsed = createUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.user.findFirst({
    where: {
      username: { equals: parsed.data.username, mode: "insensitive" },
    },
  });

  if (existing) {
    return { success: false, error: "Username already taken" };
  }

  const passwordHash = await hashPassword(parsed.data.temporaryPassword);

  await prisma.user.create({
    data: {
      username: parsed.data.username,
      full_name: parsed.data.fullName,
      email: parsed.data.email || null,
      role: parsed.data.role,
      password_hash: passwordHash,
      must_change_password: true,
      is_active: true,
    },
  });

  revalidatePath("/manager/users");
  return { success: true };
}

export async function resetPasswordAction(userId: string, tempPassword: string) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("Not authenticated");
  assertManager(session.user.role);

  if (!tempPassword || tempPassword.length < 8) {
    throw new Error("Temporary password must be at least 8 characters");
  }

  const passwordHash = await hashPassword(tempPassword);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password_hash: passwordHash,
      must_change_password: true,
    },
  });

  // Invalidate any active sessions for the user
  await prisma.session.deleteMany({ where: { user_id: userId } });

  revalidatePath("/manager/users");
  return { success: true };
}

export async function toggleUserStatusAction(userId: string) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("Not authenticated");
  assertManager(session.user.role);

  // Prevent manager from deactivating themselves
  if (session.user.id === userId) {
    throw new Error("Cannot deactivate your own account");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  await prisma.user.update({
    where: { id: userId },
    data: { is_active: !user.is_active },
  });

  if (user.is_active) {
    // If we just deactivated them, wipe sessions
    await prisma.session.deleteMany({ where: { user_id: userId } });
  }

  revalidatePath("/manager/users");
  return { success: true };
}
