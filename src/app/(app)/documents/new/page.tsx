import { DocumentForm } from "@/components/documents/document-form";
import { getDocumentOptions } from "@/lib/actions/documents";

export default async function NewDocumentPage() {
  const options = await getDocumentOptions();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">New Document</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Add document metadata for a client or project.
        </p>
      </div>

      {options.canCreate ? (
        <DocumentForm clients={options.clients} projects={options.projects} />
      ) : (
        <div className="rounded-xl border bg-white p-6 text-sm text-zinc-500">
          You do not have permission to create documents.
        </div>
      )}
    </>
  );
}
