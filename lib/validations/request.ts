import { z } from "zod";

export const createLeaveSchema = z.object({
  leaveType: z.enum(["SICK", "CASUAL", "ANNUAL", "UNPAID", "OTHER"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  reason: z.string().min(5, "Please provide a reason (min 5 characters)"),
});

export const createComplaintSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
  description: z.string().min(10, "Please provide detailed description (min 10 characters)"),
});

export const createGeneralTicketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
  description: z.string().min(5, "Please describe the issue or question"),
});

export const reviewRequestSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["APPROVED", "REJECTED", "RESOLVED", "CLOSED"]),
  remarks: z.string().min(3, "Reviewer remarks are required (min 3 characters)"),
});
