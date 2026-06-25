import { z } from "zod";

export const leadStatusSchema = z.enum([
  "new_lead",
  "contacted",
  "proposal",
  "converted",
  "lost",
]);

export const leadSchema = z.object({
  leadName: z.string().min(2, "Lead name is required"),
  company: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  source: z.string().optional(),
  status: leadStatusSchema,
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type LeadStatus = z.infer<typeof leadStatusSchema>;
