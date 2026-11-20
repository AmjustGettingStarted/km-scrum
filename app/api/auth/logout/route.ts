import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { invalidateSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (rawToken) {
    await invalidateSession(rawToken);
    cookieStore.delete(SESSION_COOKIE_NAME);
  }

  const url = new URL("/login", request.url);
  return NextResponse.redirect(url);
}
