import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().min(5, "Description must be at least 5 characters"),
  assignedToId: z.string().optional().nullable(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Scheduled date must be YYYY-MM-DD"),
  dueDate: z.string().optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const transitionStatusSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
  newStatus: z.enum(["TO_DO", "IN_PROGRESS", "PENDING", "TESTING", "RELEASED", "COMPLETED"]),
  reason: z
    .string()
    .min(5, "A reason of at least 5 characters is mandatory for every status change")
    .max(1000, "Reason is too long"),
});

export type TransitionStatusInput = z.infer<typeof transitionStatusSchema>;
