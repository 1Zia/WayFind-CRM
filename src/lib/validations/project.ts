import { z } from "zod";

export const projectSchema = z.object({
  clientId: z.string().uuid().optional().or(z.literal("")),
  name: z.string().min(2, "Project name is required"),
  description: z.string().optional(),
  budget: z.coerce.number().min(0),
  startDate: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(["planning", "active", "review", "completed", "cancelled"]),
});

export type ProjectInput = z.infer<typeof projectSchema>;
