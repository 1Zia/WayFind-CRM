import { z } from "zod";

const optionalUuid = z.string().uuid().optional().or(z.literal(""));

export const documentSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().url("Enter a valid file URL"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.coerce.number().int().min(0, "File size must be zero or more"),
  clientId: optionalUuid,
  projectId: optionalUuid,
});

export type DocumentInput = z.infer<typeof documentSchema>;
