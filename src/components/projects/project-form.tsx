"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { ProjectInput } from "@/lib/validations/project";
import { createProject, updateProject } from "@/lib/actions/projects";

type ProjectFormProps = {
  project?: ProjectInput & { id: string };
  clients?: Array<{
    id: string;
    companyName: string;
  }>;
};

export function ProjectForm({ project, clients = [] }: ProjectFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<ProjectInput>({
    clientId: (project as any)?.clientId ?? "",
    name: project?.name ?? "",
    description: project?.description ?? "",
    budget: project?.budget ?? 0,
    startDate: project?.startDate ?? "",
    deadline: project?.deadline ?? "",
    status: project?.status ?? "planning",
  });

  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof ProjectInput>(
    name: K,
    value: ProjectInput[K],
  ) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);

      if (project?.id) {
        await updateProject(project.id, form);
        toast.success("Project updated");
      } else {
        await createProject(form);
        toast.success("Project created");
      }

      router.push("/projects");
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
        <label className="text-sm font-medium">Name</label>
        <input
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Project name"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={form.description ?? ""}
          onChange={(e) => updateField("description", e.target.value)}
          className="mt-1 min-h-28 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Project description"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Budget</label>
        <input
          type="number"
          value={form.budget as any}
          onChange={(e) => updateField("budget", Number(e.target.value))}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="0"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Client</label>
        <select
          value={form.clientId ?? ""}
          onChange={(e) => updateField("clientId", e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">No client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.companyName}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={form.startDate ?? ""}
            onChange={(e) => updateField("startDate", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Deadline</label>
          <input
            type="date"
            value={form.deadline ?? ""}
            onChange={(e) => updateField("deadline", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Status</label>
        <select
          value={form.status}
          onChange={(e) =>
            updateField("status", e.target.value as ProjectInput["status"])
          }
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <button
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Saving..." : project ? "Update Project" : "Create Project"}
      </button>
    </form>
  );
}
