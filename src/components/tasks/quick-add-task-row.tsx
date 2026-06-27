"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createTask } from "@/lib/actions/tasks";

type Option = {
  id: string;
  name: string;
};

export function QuickAddTaskRow({
  colSpan = 11,
  disabled,
  projects,
  sprintId,
  users,
}: {
  colSpan?: number;
  disabled?: boolean;
  projects: Option[];
  sprintId?: string | null;
  users: Option[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      setLoading(true);
      await createTask({
        title,
        description: "",
        projectId,
        sprintId: sprintId ?? "",
        assignedTo,
        priority: "medium",
        type: "feature",
        taskCode: "",
        estimatePoints: 0,
        epic: "",
        githubLink: "",
        dueDate: "",
        status: "todo",
      });
      toast.success("Task created");
      setTitle("");
      setProjectId("");
      setAssignedTo("");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  if (disabled) {
    return null;
  }

  if (!open) {
    return (
      <tr>
        <td colSpan={colSpan} className="border-t px-4 py-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-purple-600"
          >
            <Plus className="h-4 w-4" />
            Add task
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={colSpan} className="border-t bg-zinc-50 px-4 py-3">
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Task title"
            className="min-w-64 flex-1 rounded-lg border px-3 py-2 text-sm"
          />
          <select
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <select
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <button
            disabled={loading}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add task"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
        </form>
      </td>
    </tr>
  );
}
