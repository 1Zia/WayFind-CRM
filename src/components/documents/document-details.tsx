import Link from "next/link";

type DocumentDetailsProps = {
  clientId?: string | null;
  clientName?: string;
  document: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    createdAt: Date;
    updatedAt: Date;
  };
  projectId?: string | null;
  projectName?: string;
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

export function DocumentDetails({
  clientId,
  clientName,
  document,
  projectId,
  projectName,
}: DocumentDetailsProps) {
  const fileTypeLabel = document.fileType || "unknown";

  return (
    <div className="space-y-6 rounded-xl border bg-white p-6">
      <div className="rounded-lg border border-dashed bg-zinc-50 p-6 text-center">
        <div className="text-sm font-medium text-zinc-950">
          {fileTypeLabel.toUpperCase()} document
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Metadata is stored in WayFind. Real file uploads will be connected in a
          later release.
        </p>
        <a
          href={document.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Open Document
        </a>
      </div>

      <div className="grid gap-4 text-sm md:grid-cols-2">
        <Detail label="File Name" value={document.fileName} />
        <Detail label="File Type" value={fileTypeLabel} />
        <Detail label="File Size" value={formatSize(document.fileSize)} />
        <RelationDetail
          href={clientId ? `/clients/${clientId}` : undefined}
          label="Client"
          value={clientName ?? "-"}
        />
        <RelationDetail
          href={projectId ? `/projects/${projectId}` : undefined}
          label="Project"
          value={projectName ?? "-"}
        />
        <Detail
          label="Uploaded"
          value={document.createdAt.toLocaleDateString()}
        />
        <Detail
          label="Updated"
          value={document.updatedAt.toLocaleDateString()}
        />
      </div>

      <div>
        <p className="text-sm text-zinc-500">File URL</p>
        <a
          href={document.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block break-all text-sm font-medium text-purple-600 hover:underline"
        >
          {document.fileUrl}
        </a>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-zinc-500">{label}</p>
      <div className="mt-1 font-medium text-zinc-950">{value}</div>
    </div>
  );
}

function RelationDetail({
  href,
  label,
  value,
}: {
  href?: string;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-zinc-500">{label}</p>
      {href && value !== "-" ? (
        <Link
          href={href}
          className="mt-1 block font-medium text-purple-600 hover:underline"
        >
          {value}
        </Link>
      ) : (
        <div className="mt-1 font-medium text-zinc-950">{value}</div>
      )}
    </div>
  );
}
