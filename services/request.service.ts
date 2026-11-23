"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth/session";
import { logActivity } from "@/services/activity.service";
import {
  createLeaveSchema,
  createComplaintSchema,
  createGeneralTicketSchema,
  reviewRequestSchema,
} from "@/lib/validations/request";
import type { RequestCategory, RequestStatus, Prisma } from "@prisma/client";

export async function getRequestsAction(category?: RequestCategory) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("Not authenticated");

  const whereClause: Prisma.RequestWhereInput = {};

  if (category) {
    whereClause.category = category;
  }

  // Strict Developer Isolation:
  // Developers can ONLY view their own requests, complaints, and leaves.
  if (session.user.role === "DEVELOPER") {
    whereClause.user_id = session.user.id;
  }

  return prisma.request.findMany({
    where: whereClause,
    include: {
      user: {
        select: { id: true, username: true, full_name: true },
      },
      reviewed_by: {
        select: { id: true, username: true, full_name: true },
      },
      history: {
        include: {
          changed_by: { select: { full_name: true } },
        },
        orderBy: { created_at: "desc" },
      },
    },
    orderBy: { created_at: "desc" },
  });
}

export async function createLeaveRequestAction(
  prevState: { success: boolean; error?: string } | null,
  formData: FormData
) {
  const session = await getSessionFromCookies();
  if (!session) return { success: false, error: "Not authenticated" };

  const raw = {
    leaveType: formData.get("leaveType"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason"),
  };

  const parsed = createLeaveSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const reqCount = await prisma.request.count();
  const requestCode = `LV-${201 + reqCount}`;

  const createdReq = await prisma.request.create({
    data: {
      request_code: requestCode,
      user_id: session.user.id,
      category: "LEAVE",
      subject: `Leave Application: ${parsed.data.leaveType}`,
      description: parsed.data.reason,
      leave_type: parsed.data.leaveType,
      start_date: new Date(parsed.data.startDate),
      end_date: new Date(parsed.data.endDate),
      status: "PENDING",
    },
  });

  await logActivity(prisma, {
    userId: session.user.id,
    activityType: "LEAVE_REQUESTED",
    requestId: createdReq.id,
    description: `Applied for ${parsed.data.leaveType} leave (${parsed.data.startDate} to ${parsed.data.endDate})`,
    reason: parsed.data.reason,
  });

  revalidatePath("/requests");
  revalidatePath("/planning/daily");
  return { success: true };
}

export async function createComplaintAction(
  prevState: { success: boolean; error?: string } | null,
  formData: FormData
) {
  const session = await getSessionFromCookies();
  if (!session) return { success: false, error: "Not authenticated" };

  const raw = {
    subject: formData.get("subject"),
    description: formData.get("description"),
  };

  const parsed = createComplaintSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const reqCount = await prisma.request.count();
  const requestCode = `CMP-${201 + reqCount}`;

  const createdCmp = await prisma.request.create({
    data: {
      request_code: requestCode,
      user_id: session.user.id,
      category: "COMPLAINT",
      subject: parsed.data.subject,
      description: parsed.data.description,
      status: "PENDING",
    },
  });

  await logActivity(prisma, {
    userId: session.user.id,
    activityType: "COMPLAINT_FILED",
    requestId: createdCmp.id,
    description: `Submitted complaint: "${parsed.data.subject}"`,
    reason: parsed.data.description,
  });

  revalidatePath("/requests");
  return { success: true };
}

export async function createGeneralTicketAction(
  prevState: { success: boolean; error?: string } | null,
  formData: FormData
) {
  const session = await getSessionFromCookies();
  if (!session) return { success: false, error: "Not authenticated" };

  const raw = {
    subject: formData.get("subject"),
    description: formData.get("description"),
  };

  const parsed = createGeneralTicketSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const reqCount = await prisma.request.count();
  const requestCode = `TCK-${201 + reqCount}`;

  const createdTck = await prisma.request.create({
    data: {
      request_code: requestCode,
      user_id: session.user.id,
      category: "GENERAL",
      subject: parsed.data.subject,
      description: parsed.data.description,
      status: "PENDING",
    },
  });

  await logActivity(prisma, {
    userId: session.user.id,
    activityType: "TICKET_RAISED",
    requestId: createdTck.id,
    description: `Submitted general ticket: "${parsed.data.subject}"`,
    reason: parsed.data.description,
  });

  revalidatePath("/requests");
  return { success: true };
}

export async function reviewRequestAction(
  requestId: string,
  newStatus: RequestStatus,
  remarks: string
) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("Not authenticated");

  if (session.user.role === "DEVELOPER") {
    throw new Error("Unauthorized: Developers cannot approve or resolve requests");
  }

  const parsed = reviewRequestSchema.safeParse({
    requestId,
    status: newStatus,
    remarks,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid review data");
  }

  const req = await prisma.request.findUnique({
    where: { id: requestId },
  });

  if (!req) throw new Error("Request not found");

  await prisma.$transaction(async (tx) => {
    await tx.request.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        reviewed_by_id: session.user.id,
        reviewer_remarks: remarks,
        reviewed_at: new Date(),
      },
    });

    await tx.requestHistory.create({
      data: {
        request_id: requestId,
        action: `STATUS_${newStatus}`,
        previous_status: req.status,
        new_status: newStatus,
        changed_by_id: session.user.id,
        remarks: remarks,
      },
    });

    await tx.activityLog.create({
      data: {
        user_id: session.user.id,
        activity_type: "REQUEST_REVIEWED",
        request_id: requestId,
        description: `${newStatus === "APPROVED" ? "Approved" : newStatus === "REJECTED" ? "Rejected" : "Resolved"} ${req.category.toLowerCase()} request ${req.request_code}: "${req.subject}"`,
        previous_value: req.status,
        new_value: newStatus,
        reason: remarks,
      },
    });
  });

  revalidatePath("/requests");
  revalidatePath("/planning/daily");
  return { success: true };
}
