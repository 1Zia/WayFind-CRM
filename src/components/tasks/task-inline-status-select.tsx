"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { updateTaskStatus } from "@/lib/actions/tasks";

type TaskStatus = "todo" | "in_progress" | "testing" | "done";

export function TaskInlineStatusSelect({
  disabled,
  status,
  taskId,
}: {
  disabled?: boolean;
  status: TaskStatus;
  taskId: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState<TaskStatus>(status);
  const [loading, setLoading] = useState(false);

  async function handleChange(nextStatus: TaskStatus) {
    try {
      setLoading(true);
      setValue(nextStatus);
      await updateTaskStatus(taskId, nextStatus);
      toast.success("Task status updated");
      router.refresh();
    } catch (error) {
      setValue(status);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      disabled={disabled || loading}
      value={value}
      onChange={(event) => handleChange(event.target.value as TaskStatus)}
      className="w-full rounded-md border px-2 py-1.5 text-xs capitalize disabled:opacity-60"
    >
      <option value="todo">Todo</option>
      <option value="in_progress">In Progress</option>
      <option value="testing">Testing</option>
      <option value="done">Done</option>
    </select>
  );
}
