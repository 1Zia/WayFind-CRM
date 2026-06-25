"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createDocument, updateDocument } from "@/lib/actions/documents";
import { useUploadThing } from "@/lib/uploadthing-client";
import type { DocumentInput } from "@/lib/validations/document";

type Option = {
  id: string;
  name: string;
};

type DocumentFormProps = {
  clients?: Option[];
  document?: DocumentInput & {
    id: string;
  };
  projects?: Option[];
  uploadReady?: boolean;
};

const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

const ACCEPTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const MAX_FILE_SIZE = 16 * 1024 * 1024;

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function isAllowedFile(file: File) {
  const extension = `.${getExtension(file.name)}`;

  return (
    ACCEPTED_EXTENSIONS.includes(extension) ||
    ACCEPTED_MIME_TYPES.has(file.type)
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentForm({
  clients = [],
  document,
  projects = [],
  uploadReady = true,
}: DocumentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState<DocumentInput>({
    fileName: document?.fileName ?? "",
    fileUrl: document?.fileUrl ?? "",
    fileType: document?.fileType ?? "",
    fileSize: document?.fileSize ?? 0,
    description: document?.description ?? "",
    clientId: document?.clientId ?? "",
    projectId: document?.projectId ?? "",
  });
  const isEditing = Boolean(document?.id);
  const { isUploading, startUpload } = useUploadThing("documentUploader", {
    onUploadProgress: (progress) => setUploadProgress(progress),
  });

  function updateField<K extends keyof DocumentInput>(
    name: K,
    value: DocumentInput[K],
  ) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!isAllowedFile(file)) {
      toast.error(
        "Unsupported file type. Upload PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, or WEBP files.",
      );
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. Maximum upload size is 16MB.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadProgress(0);
  }

  async function uploadSelectedFile() {
    if (!selectedFile) {
      throw new Error("Please select a document file to upload.");
    }

    const uploadResult = await startUpload([selectedFile]);
    const uploadedFile = uploadResult?.[0];

    if (!uploadedFile) {
      throw new Error("Upload failed. Please try again.");
    }

    return {
      fileName: uploadedFile.serverData?.fileName ?? uploadedFile.name,
      fileUrl:
        uploadedFile.serverData?.fileUrl ??
        uploadedFile.ufsUrl ??
        uploadedFile.url,
      fileType:
        uploadedFile.serverData?.fileType ||
        uploadedFile.type ||
        selectedFile.type ||
        getExtension(selectedFile.name),
      fileSize:
        uploadedFile.serverData?.fileSize ?? uploadedFile.size ?? selectedFile.size,
    };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!isEditing && !uploadReady) {
      toast.error("UploadThing is not configured. Add UPLOADTHING_TOKEN first.");
      return;
    }

    try {
      setLoading(true);

      if (document?.id) {
        await updateDocument(document.id, form);
        toast.success("Document updated");
      } else {
        const uploadedMetadata = await uploadSelectedFile();

        await createDocument({
          ...form,
          ...uploadedMetadata,
        });
        toast.success("Document uploaded");
      }

      router.push("/documents");
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
      {isEditing ? (
        <div className="rounded-lg border bg-zinc-50 p-4 text-sm">
          <p className="font-medium text-zinc-950">{form.fileName}</p>
          <p className="mt-1 text-zinc-500">
            {form.fileType} - {formatSize(form.fileSize)}
          </p>
          <a
            href={form.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-purple-600 hover:underline"
          >
            Open current document
          </a>
        </div>
      ) : (
        <div>
          <label className="text-sm font-medium">Upload Document</label>
          <div className="mt-1 rounded-lg border border-dashed bg-zinc-50 p-4">
            <input
              type="file"
              accept={ACCEPTED_EXTENSIONS.join(",")}
              disabled={!uploadReady || loading || isUploading}
              onChange={handleFileChange}
              className="block w-full text-sm text-zinc-700 file:mr-4 file:rounded-lg file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 disabled:opacity-60"
            />
            <p className="mt-2 text-xs text-zinc-500">
              PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, or WEBP up to 16MB.
            </p>
            {!uploadReady ? (
              <p className="mt-2 text-xs font-medium text-red-600">
                UploadThing is not configured. Add UPLOADTHING_TOKEN to enable
                uploads.
              </p>
            ) : null}
            {selectedFile ? (
              <p className="mt-2 text-sm font-medium text-zinc-950">
                Selected: {selectedFile.name} ({formatSize(selectedFile.size)})
              </p>
            ) : null}
            {isUploading || uploadProgress > 0 ? (
              <p className="mt-2 text-xs text-zinc-500">
                Upload progress: {uploadProgress}%
              </p>
            ) : null}
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={form.description ?? ""}
          onChange={(event) => updateField("description", event.target.value)}
          className="mt-1 min-h-24 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Optional notes about this document"
        />
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
        disabled={loading || isUploading || (!isEditing && !uploadReady)}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading || isUploading
          ? isUploading
            ? "Uploading..."
            : "Saving..."
          : isEditing
            ? "Update Document"
            : "Upload Document"}
      </button>
    </form>
  );
}
