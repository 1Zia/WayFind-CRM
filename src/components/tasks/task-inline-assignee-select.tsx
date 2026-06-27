"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { updateTaskAssignee } from "@/lib/actions/tasks";

type UserOption = {
  id: string;
  name: string;
};

export function TaskInlineAssigneeSelect({
  assignedTo,
  disabled,
  taskId,
  users,
}: {
  assignedTo: string | null;
  disabled?: boolean;
  taskId: string;
  users: UserOption[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(assignedTo ?? "");
  const [loading, setLoading] = useState(false);

  async function handleChange(nextAssignee: string) {
    try {
      setLoading(true);
      setValue(nextAssignee);
      await updateTaskAssignee(taskId, nextAssignee);
      toast.success("Task assignee updated");
      router.refresh();
    } catch (error) {
      setValue(assignedTo ?? "");
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
      <option value="">Unassigned</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name}
        </option>
      ))}
    </select>
  );
}
