type DocumentDetailsProps = {
  clientName?: string;
  document: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    createdAt: Date;
    updatedAt: Date;
  };
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
  clientName,
  document,
  projectName,
}: DocumentDetailsProps) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="grid gap-4 text-sm md:grid-cols-2">
        <Detail label="File Name" value={document.fileName} />
        <Detail label="File Type" value={document.fileType} />
        <Detail label="File Size" value={formatSize(document.fileSize)} />
        <Detail label="Client" value={clientName ?? "-"} />
        <Detail label="Project" value={projectName ?? "-"} />
        <Detail
          label="Uploaded"
          value={document.createdAt.toLocaleDateString()}
        />
        <Detail
          label="Updated"
          value={document.updatedAt.toLocaleDateString()}
        />
      </div>

      <div className="mt-6">
        <p className="text-sm text-zinc-500">File URL</p>
        <a
          href={document.fileUrl}
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
