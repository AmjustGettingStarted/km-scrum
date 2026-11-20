import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

export const SESSION_COOKIE_NAME = "km_session";
const SESSION_TTL_DAYS = 7;

export interface SessionUser {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
}

export function hashSessionToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export async function createSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      token_hash: tokenHash,
      user_id: userId,
      expires_at: expiresAt,
      user_agent: userAgent,
      ip_address: ipAddress,
    },
  });

  return rawToken;
}

export async function validateSession(rawToken: string): Promise<{
  user: SessionUser;
  expiresAt: Date;
} | null> {
  const tokenHash = hashSessionToken(rawToken);

  const session = await prisma.session.findUnique({
    where: { token_hash: tokenHash },
    include: {
      user: true,
    },
  });

  if (!session) return null;

  // Check if session has expired
  if (session.expires_at < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  // Reject inactive accounts
  if (!session.user.is_active) {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      username: session.user.username,
      fullName: session.user.full_name,
      email: session.user.email,
      role: session.user.role,
      isActive: session.user.is_active,
      mustChangePassword: session.user.must_change_password,
    },
    expiresAt: session.expires_at,
  };
}

export async function invalidateSession(rawToken: string): Promise<void> {
  const tokenHash = hashSessionToken(rawToken);
  await prisma.session.deleteMany({
    where: { token_hash: tokenHash },
  });
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { user_id: userId },
  });
}

export async function getSessionFromCookies(): Promise<{
  user: SessionUser;
  expiresAt: Date;
} | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!rawToken) return null;

  return validateSession(rawToken);
}
