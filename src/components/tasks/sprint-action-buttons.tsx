"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { completeSprint, startSprint } from "@/lib/actions/sprints";

export function SprintActionButtons({
  sprintId,
  status,
}: {
  sprintId: string;
  status: "planned" | "active" | "completed" | "archived";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "start" | "complete") {
    try {
      setLoading(true);
      if (action === "start") {
        await startSprint(sprintId);
        toast.success("Sprint started");
      } else {
        await completeSprint(sprintId);
        toast.success("Sprint completed");
      }
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "planned" ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction("start")}
          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 disabled:opacity-60"
        >
          Start
        </button>
      ) : null}
      {status === "active" ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction("complete")}
          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 disabled:opacity-60"
        >
          Complete
        </button>
      ) : null}
    </div>
  );
}
