import { z } from "zod";

export const clientSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive", "prospect", "archived"]),
  notes: z.string().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;
