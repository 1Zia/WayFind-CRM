import Link from "next/link";

import { DocumentTable } from "@/components/documents/document-table";
import { PageHeader } from "@/components/shared/page-header";
import { getDocumentOptions, getDocuments } from "@/lib/actions/documents";

export default async function DocumentsPage() {
  const [documents, options] = await Promise.all([
    getDocuments(),
    getDocumentOptions(),
  ]);

  return (
    <>
      <PageHeader
        title="Documents"
        description="Manage company files and attachments."
        action={
          options.canCreate ? (
            <Link href="/documents/new" className="crm-btn-primary">
              New Document
            </Link>
          ) : null
        }
      />

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
