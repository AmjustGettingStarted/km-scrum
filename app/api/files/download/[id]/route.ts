import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { getSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

interface DownloadRouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: DownloadRouteProps) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: attachmentId } = await params;

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        task: {
          select: { id: true, assigned_to_id: true },
        },
      },
    });

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    // Role check: Developer can only download files from tasks assigned to them
    if (
      session.user.role === "DEVELOPER" &&
      attachment.task.assigned_to_id !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Forbidden: You can only download attachments of your assigned tasks" },
        { status: 403 }
      );
    }

    // Create Presigned GET URL valid for 5 minutes (300 seconds)
    const getCommand = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: attachment.file_key,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(attachment.file_name)}"`,
    });

    const signedUrl = await getSignedUrl(r2, getCommand, { expiresIn: 300 });

    return NextResponse.redirect(signedUrl, 307);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Download failed" },
      { status: 500 }
    );
  }
}
