import Link from "next/link";

import { DocumentDetails } from "@/components/documents/document-details";
import { getDocumentById, getDocumentOptions } from "@/lib/actions/documents";

export default async function DocumentPage({
  params,
}: {
  params: { documentId: string };
}) {
  const [document, options] = await Promise.all([
    getDocumentById(params.documentId),
    getDocumentOptions(),
  ]);
  const clientName = document.clientId
    ? options.clients.find((client) => client.id === document.clientId)?.name
    : undefined;
  const projectName = document.projectId
    ? options.projects.find((project) => project.id === document.projectId)
        ?.name
    : undefined;

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {document.fileName}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Document details</p>
        </div>

        {options.canUpdate ? (
          <Link
            href={`/documents/${document.id}/edit`}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Edit
          </Link>
        ) : null}
      </div>

      <DocumentDetails
        clientId={document.clientId}
        clientName={clientName}
        document={document}
        projectId={document.projectId}
        projectName={projectName}
        uploadedByEmail={document.uploadedByEmail}
        uploadedByName={document.uploadedByName}
      />
    </>
  );
}
