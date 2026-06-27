import { logServerError } from "@/lib/errors";

export async function withSafeFallback<T>(
  context: string,
  callback: () => Promise<T>,
  fallback: T,
) {
  try {
    return await callback();
  } catch (error) {
    logServerError(context, error);
    return fallback;
  }
}
