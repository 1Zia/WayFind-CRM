import { DocumentForm } from "@/components/documents/document-form";
import { getDocumentById, getDocumentOptions } from "@/lib/actions/documents";

export default async function DocumentEditPage({
  params,
}: {
  params: { documentId: string };
}) {
  const [document, options] = await Promise.all([
    getDocumentById(params.documentId),
    getDocumentOptions(),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit Document
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Update document metadata.
        </p>
      </div>

      {options.canUpdate ? (
        <DocumentForm
          clients={options.clients}
          document={{
            id: document.id,
            fileName: document.fileName,
            fileUrl: document.fileUrl,
            fileType: document.fileType,
            fileSize: document.fileSize,
            clientId: document.clientId ?? "",
            projectId: document.projectId ?? "",
          }}
          projects={options.projects}
        />
      ) : (
        <div className="rounded-xl border bg-white p-6 text-sm text-zinc-500">
          You do not have permission to update documents.
        </div>
      )}
    </>
  );
}
