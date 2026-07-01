"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateTaskStatus } from "@/lib/actions/tasks";

type TaskStatus = "todo" | "in_progress" | "testing" | "done";

type TaskStatusFormProps = {
  taskId: string;
  status: TaskStatus;
};

export function TaskStatusForm({ taskId, status }: TaskStatusFormProps) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState<TaskStatus>(status);
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: TaskStatus) {
    try {
      setLoading(true);
      setNextStatus(status);
      await updateTaskStatus(taskId, status);
      toast.success("Task status updated");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await updateStatus(nextStatus);
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading || status === "in_progress"}
          onClick={() => updateStatus("in_progress")}
          className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
        >
          Start Task
        </button>
        <button
          type="button"
          disabled={loading || status === "testing"}
          onClick={() => updateStatus("testing")}
          className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
        >
          Send to Testing
        </button>
        <button
          type="button"
          disabled={loading || status === "done"}
          onClick={() => updateStatus("done")}
          className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
        >
          Mark Done
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value as TaskStatus)}
            className="mt-1 block rounded-lg border px-3 py-2 text-sm"
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="testing">Testing</option>
            <option value="done">Done</option>
          </select>
        </div>

        <button
          disabled={loading}
          className="liquid-glass-primary rounded-xl px-4 py-2 text-sm font-semibold text-slate-900 hover:shadow-theme-md disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Status"}
        </button>
      </form>
    </div>
  );
}
