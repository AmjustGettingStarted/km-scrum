import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // If DATABASE_URL is not set yet in development, return placeholder status
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        status: "ok",
        database: "unconfigured",
        timestamp: new Date().toISOString(),
      });
    }

    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Database connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
