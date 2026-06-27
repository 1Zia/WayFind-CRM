import { z } from "zod";

export const sprintSchema = z.object({
  name: z.string().min(2, "Sprint name is required"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["planned", "active", "completed", "archived"]).default("planned"),
});

export type SprintInput = z.infer<typeof sprintSchema>;
