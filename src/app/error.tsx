"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      reset={reset}
      title="Something went wrong"
      message="An unexpected error occurred while loading this page."
    />
  );
}
