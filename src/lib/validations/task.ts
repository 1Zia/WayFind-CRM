import { z } from "zod";

export const taskSchema = z.object({
  projectId: z.string().uuid().optional().or(z.literal("")),
  sprintId: z.string().uuid().optional().or(z.literal("")),
  title: z.string().min(2, "Task title is required"),
  description: z.string().optional(),
  assignedTo: z.string().uuid().optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  type: z
    .enum(["feature", "bug", "improvement", "research", "testing", "other"])
    .default("feature"),
  taskCode: z.string().optional(),
  estimatePoints: z.coerce.number().int().min(0).max(100).default(0),
  epic: z.string().optional(),
  githubLink: z.string().url().optional().or(z.literal("")),
  dueDate: z.string().optional(),
  status: z.enum(["todo", "in_progress", "testing", "done"]),
});

export type TaskInput = z.infer<typeof taskSchema>;
