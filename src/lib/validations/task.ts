import { z } from "zod";

export const taskSchema = z.object({
  projectId: z.string().uuid().optional().or(z.literal("")),
  title: z.string().min(2, "Task title is required"),
  description: z.string().optional(),
  assignedTo: z.string().uuid().optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  dueDate: z.string().optional(),
  status: z.enum(["todo", "in_progress", "testing", "done"]),
});

export type TaskInput = z.infer<typeof taskSchema>;
