"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createDocument } from "@/lib/actions/documents";
import type { DocumentInput } from "@/lib/validations/document";

type Option = {
  id: string;
  name: string;
};

type DocumentUploaderProps = {
  clients?: Option[];
  projects?: Option[];
};

export function DocumentUploader({
  clients = [],
  projects = [],
}: DocumentUploaderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<DocumentInput>({
    fileName: "",
    fileUrl: "",
    fileType: "",
    fileSize: 0,
    clientId: "",
    projectId: "",
  });

  function updateField<K extends keyof DocumentInput>(
    name: K,
    value: DocumentInput[K],
  ) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      await createDocument(form);
      toast.success("Document metadata saved");
      setForm({
        fileName: "",
        fileUrl: "",
        fileType: "",
        fileSize: 0,
        clientId: "",
        projectId: "",
      });
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
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">File Name</label>
          <input
            value={form.fileName}
            onChange={(event) => updateField("fileName", event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="contract.pdf"
          />
        </div>

        <div>
          <label className="text-sm font-medium">File URL</label>
          <input
            value={form.fileUrl}
            onChange={(event) => updateField("fileUrl", event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="/documents/contract.pdf"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">File Type</label>
          <input
            value={form.fileType}
            onChange={(event) => updateField("fileType", event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="application/pdf"
          />
        </div>

        <div>
          <label className="text-sm font-medium">File Size</label>
          <input
            type="number"
            value={form.fileSize}
            onChange={(event) =>
              updateField("fileSize", Number(event.target.value))
            }
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Client</label>
          <select
            value={form.clientId ?? ""}
            onChange={(event) => updateField("clientId", event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">No client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Project</label>
          <select
            value={form.projectId ?? ""}
            onChange={(event) => updateField("projectId", event.target.value)}
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
      </div>

      <button
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Document Metadata"}
      </button>
    </form>
  );
}
