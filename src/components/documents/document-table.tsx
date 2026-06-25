"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteDocument } from "@/lib/actions/documents";

type DocumentRow = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description: string | null;
  clientId: string | null;
  projectId: string | null;
  uploadedBy: string;
  uploadedByEmail: string | null;
  uploadedByName: string | null;
  createdAt: Date;
};

type Option = {
  id: string;
  name: string;
};

type DocumentTableProps = {
  canDelete?: boolean;
  canUpdate?: boolean;
  clients?: Option[];
  documents: DocumentRow[];
  projects?: Option[];
};

function formatSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentTable({
  canDelete = false,
  canUpdate = false,
  clients = [],
  documents,
  projects = [],
}: DocumentTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const clientNames = new Map(clients.map((client) => [client.id, client.name]));
  const projectNames = new Map(
    projects.map((project) => [project.id, project.name]),
  );

  async function handleDelete(documentId: string) {
    const confirmed = window.confirm("Delete this document metadata?");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(documentId);
      await deleteDocument(documentId);
      toast.success("Document deleted");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-zinc-50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">File Name</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Size</th>
            <th className="px-4 py-3 font-medium">Client</th>
            <th className="px-4 py-3 font-medium">Project</th>
            <th className="px-4 py-3 font-medium">Uploaded By</th>
            <th className="px-4 py-3 font-medium">Uploaded</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>

        <tbody>
          {documents.map((document) => (
            <tr key={document.id} className="border-b last:border-0">
              <td className="px-4 py-3 font-medium">{document.fileName}</td>
              <td className="px-4 py-3">{document.fileType}</td>
              <td className="px-4 py-3">{formatSize(document.fileSize)}</td>
              <td className="px-4 py-3">
                {document.clientId ? (
                  <Link
                    href={`/clients/${document.clientId}`}
                    className="text-purple-600 hover:underline"
                  >
                    {clientNames.get(document.clientId) ?? document.clientId}
                  </Link>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-3">
                {document.projectId ? (
                  <Link
                    href={`/projects/${document.projectId}`}
                    className="text-purple-600 hover:underline"
                  >
                    {projectNames.get(document.projectId) ?? document.projectId}
                  </Link>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-3">
                {document.uploadedByName ??
                  document.uploadedByEmail ??
                  document.uploadedBy}
              </td>
              <td className="px-4 py-3">
                {document.createdAt.toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/documents/${document.id}`}
                    className="text-purple-600 hover:underline"
                  >
                    View
                  </Link>
                  <a
                    href={document.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-600 hover:underline"
                  >
                    Open
                  </a>
                  {canUpdate ? (
                    <Link
                      href={`/documents/${document.id}/edit`}
                      className="text-purple-600 hover:underline"
                    >
                      Edit
                    </Link>
                  ) : null}
                  {canDelete ? (
                    <button
                      type="button"
                      disabled={deletingId === document.id}
                      onClick={() => handleDelete(document.id)}
                      className="text-red-600 hover:underline disabled:opacity-60"
                    >
                      {deletingId === document.id ? "Deleting..." : "Delete"}
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}

          {documents.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-zinc-500">
                <div className="font-medium text-zinc-950">
                  No documents yet.
                </div>
                <div className="mt-1 text-sm">
                  Upload contracts, proposals, invoices, receipts, requirement
                  docs, or design files.
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
