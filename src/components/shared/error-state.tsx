"use client";

import Link from "next/link";

type ErrorStateProps = {
  title?: string;
  message?: string;
  reset?: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  message = "The page could not be loaded. Please try again.",
  reset,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="max-w-md rounded-xl border bg-white p-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-zinc-500">{message}</p>
        <div className="mt-5 flex justify-center gap-3">
          {reset ? (
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Try again
            </button>
          ) : null}
          <Link
            href="/dashboard"
            className="liquid-glass-primary rounded-xl px-4 py-2 text-sm font-semibold text-slate-900 hover:shadow-theme-md"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
