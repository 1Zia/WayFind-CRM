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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      await updateTaskStatus(taskId, nextStatus);
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

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex items-end gap-3">
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
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Updating..." : "Update Status"}
      </button>
    </form>
  );
}
