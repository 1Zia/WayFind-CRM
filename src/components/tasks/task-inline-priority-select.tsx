"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { updateTaskPriority } from "@/lib/actions/tasks";

type TaskPriority = "low" | "medium" | "high" | "urgent";

export function TaskInlinePrioritySelect({
  disabled,
  priority,
  taskId,
}: {
  disabled?: boolean;
  priority: TaskPriority;
  taskId: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState<TaskPriority>(priority);
  const [loading, setLoading] = useState(false);

  async function handleChange(nextPriority: TaskPriority) {
    try {
      setLoading(true);
      setValue(nextPriority);
      await updateTaskPriority(taskId, nextPriority);
      toast.success("Task priority updated");
      router.refresh();
    } catch (error) {
      setValue(priority);
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
      onChange={(event) => handleChange(event.target.value as TaskPriority)}
      className="w-full rounded-md border px-2 py-1.5 text-xs capitalize disabled:opacity-60"
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="urgent">Urgent</option>
    </select>
  );
}
