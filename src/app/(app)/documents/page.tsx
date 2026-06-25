import Link from "next/link";

import { DocumentTable } from "@/components/documents/document-table";
import { getDocumentOptions, getDocuments } from "@/lib/actions/documents";

export default async function DocumentsPage() {
  const [documents, options] = await Promise.all([
    getDocuments(),
    getDocumentOptions(),
  ]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage company files and attachments.
          </p>
        </div>

        {options.canCreate ? (
          <Link
            href="/documents/new"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            New Document
          </Link>
        ) : null}
      </div>

      <DocumentTable
        canDelete={options.canDelete}
        canUpdate={options.canUpdate}
        clients={options.clients}
        documents={documents}
        projects={options.projects}
      />
    </>
  );
}
