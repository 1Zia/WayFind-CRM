"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { moveTaskToSprint } from "@/lib/actions/tasks";

type SprintOption = {
  id: string;
  name: string;
  status: string;
};

export function TaskInlineSprintSelect({
  disabled,
  sprintId,
  sprints,
  taskId,
}: {
  disabled?: boolean;
  sprintId: string | null;
  sprints: SprintOption[];
  taskId: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(sprintId ?? "");
  const [loading, setLoading] = useState(false);

  async function handleChange(nextSprintId: string) {
    try {
      setLoading(true);
      setValue(nextSprintId);
      await moveTaskToSprint(taskId, nextSprintId);
      toast.success("Task moved");
      router.refresh();
    } catch (error) {
      setValue(sprintId ?? "");
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
      onChange={(event) => handleChange(event.target.value)}
      className="w-full rounded-md border px-2 py-1.5 text-xs disabled:opacity-60"
    >
      <option value="">Backlog</option>
      {sprints.map((sprint) => (
        <option key={sprint.id} value={sprint.id}>
          {sprint.name}
        </option>
      ))}
    </select>
  );
}
