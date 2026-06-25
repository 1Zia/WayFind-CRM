import { z } from "zod";

const optionalUuid = z.string().uuid().optional().or(z.literal(""));
const optionalText = z.string().optional();
const amount = z.coerce.number().int().min(0, "Amount must be zero or more");

export const incomeSchema = z.object({
  clientId: optionalUuid,
  projectId: optionalUuid,
  amount,
  paymentDate: z.string().min(1, "Payment date is required"),
  status: z.enum(["pending", "paid", "overdue", "cancelled"]),
  notes: optionalText,
});

export const expenseSchema = z.object({
  title: z.string().min(2, "Title is required"),
  category: z.enum([
    "salary",
    "rent",
    "software",
    "marketing",
    "travel",
    "utilities",
    "miscellaneous",
  ]),
  amount,
  date: z.string().min(1, "Date is required"),
  approvedBy: optionalUuid,
  notes: optionalText,
});

export const invoiceSchema = z.object({
  clientId: optionalUuid,
  projectId: optionalUuid,
  invoiceNumber: z.string().min(2, "Invoice number is required"),
  amount,
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  paidAt: z.string().optional().or(z.literal("")),
  notes: optionalText,
});

export type IncomeInput = z.infer<typeof incomeSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
