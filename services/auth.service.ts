"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { 
  createSession, 
  invalidateSession, 
  SESSION_COOKIE_NAME, 
  getSessionFromCookies,
  invalidateAllUserSessions
} from "@/lib/auth/session";
import { loginSchema, changePasswordSchema } from "@/lib/validations/auth";

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

export async function loginAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { username, password } = parsed.data;

  // Look up user (case-insensitive username lookup)
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
  });

  if (!user || !user.is_active) {
    return {
      success: false,
      error: "Invalid username or password",
    };
  }

  const isValidPassword = await verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    return {
      success: false,
      error: "Invalid username or password",
    };
  }

  // Extract client metadata
  const headerList = await headers();
  const userAgent = headerList.get("user-agent") ?? undefined;
  const ipAddress =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    undefined;

  // Create database session token
  const rawToken = await createSession(user.id, userAgent, ipAddress);

  // Set secure HttpOnly cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  if (user.must_change_password) {
    redirect("/change-password");
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (rawToken) {
    await invalidateSession(rawToken);
    cookieStore.delete(SESSION_COOKIE_NAME);
  }

  redirect("/login");
}

export async function changePasswordAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  const rawData = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = changePasswordSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  const isCurrentValid = await verifyPassword(parsed.data.currentPassword, user.password_hash);
  if (!isCurrentValid) {
    return {
      success: false,
      error: "Current password is incorrect",
    };
  }

  const newHash = await hashPassword(parsed.data.newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password_hash: newHash,
      must_change_password: false,
    },
  });

  // Invalidate all other active sessions for safety
  await invalidateAllUserSessions(user.id);

  // Issue fresh session
  const rawToken = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  redirect("/dashboard");
}
