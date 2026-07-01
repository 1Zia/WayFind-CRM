"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createTask, updateTask } from "@/lib/actions/tasks";
import type { TaskInput } from "@/lib/validations/task";

type TaskOption = {
  id: string;
  name: string;
};

type TaskFormProps = {
  task?: TaskInput & { id: string };
  projects?: TaskOption[];
  sprints?: Array<TaskOption & { status?: string }>;
  users?: TaskOption[];
};

export function TaskForm({
  task,
  projects = [],
  sprints = [],
  users = [],
}: TaskFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<TaskInput>({
    projectId: task?.projectId ?? "",
    sprintId: task?.sprintId ?? "",
    title: task?.title ?? "",
    description: task?.description ?? "",
    assignedTo: task?.assignedTo ?? "",
    priority: task?.priority ?? "medium",
    type: task?.type ?? "feature",
    taskCode: task?.taskCode ?? "",
    estimatePoints: task?.estimatePoints ?? 0,
    epic: task?.epic ?? "",
    githubLink: task?.githubLink ?? "",
    dueDate: task?.dueDate ?? "",
    status: task?.status ?? "todo",
  });

  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof TaskInput>(name: K, value: TaskInput[K]) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);

      if (task?.id) {
        await updateTask(task.id, form);
        toast.success("Task updated");
      } else {
        await createTask(form);
        toast.success("Task created");
      }

      router.push("/tasks");
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
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-5 rounded-xl border bg-white p-6"
    >
      <div>
        <label className="text-sm font-medium">Title</label>
        <input
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Task title"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={form.description ?? ""}
          onChange={(e) => updateField("description", e.target.value)}
          className="mt-1 min-h-28 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Task details"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Project</label>
        <select
          value={form.projectId ?? ""}
          onChange={(e) => updateField("projectId", e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">No project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Sprint</label>
        <select
          value={form.sprintId ?? ""}
          onChange={(e) => updateField("sprintId", e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Backlog</option>
          {sprints.map((sprint) => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name}
              {sprint.status ? ` (${sprint.status})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Assigned To</label>
        <select
          value={form.assignedTo ?? ""}
          onChange={(e) => updateField("assignedTo", e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Priority</label>
          <select
            value={form.priority}
            onChange={(e) =>
              updateField("priority", e.target.value as TaskInput["priority"])
            }
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Type</label>
          <select
            value={form.type}
            onChange={(e) =>
              updateField("type", e.target.value as TaskInput["type"])
            }
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="feature">Feature</option>
            <option value="bug">Bug</option>
            <option value="improvement">Improvement</option>
            <option value="research">Research</option>
            <option value="testing">Testing</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            value={form.status}
            onChange={(e) =>
              updateField("status", e.target.value as TaskInput["status"])
            }
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="testing">Testing</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Task ID / Code</label>
          <input
            value={form.taskCode ?? ""}
            onChange={(e) => updateField("taskCode", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="WAY-001"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Estimate Points</label>
          <input
            type="number"
            min={0}
            max={100}
            value={form.estimatePoints ?? 0}
            onChange={(e) =>
              updateField("estimatePoints", Number(e.target.value))
            }
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Epic</label>
        <input
          value={form.epic ?? ""}
          onChange={(e) => updateField("epic", e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Optional epic or milestone"
        />
      </div>

      <div>
        <label className="text-sm font-medium">GitHub Link</label>
        <input
          value={form.githubLink ?? ""}
          onChange={(e) => updateField("githubLink", e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Optional URL"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Due Date</label>
        <input
          type="date"
          value={form.dueDate ?? ""}
          onChange={(e) => updateField("dueDate", e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      <button
        disabled={loading}
        className="liquid-glass-primary rounded-xl px-4 py-2 text-sm font-semibold text-slate-900 hover:shadow-theme-md disabled:opacity-60"
      >
        {loading ? "Saving..." : task ? "Update Task" : "Create Task"}
      </button>
    </form>
  );
}
