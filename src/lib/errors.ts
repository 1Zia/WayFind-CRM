export function logServerError(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`[WayFind:${context}] ${message}`, error);
}

export function getSafeErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    if (error.message === "Forbidden" || error.message === "Unauthorized") {
      return error.message;
    }
  }

  return fallback;
}
