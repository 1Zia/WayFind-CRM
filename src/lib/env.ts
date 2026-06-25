import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_CLERK_SIGN_IN_URL is required"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_CLERK_SIGN_UP_URL is required"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL is required"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL is required"),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const missing = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment configuration:\n${missing}`);
}

export const env = parsedEnv.data;
