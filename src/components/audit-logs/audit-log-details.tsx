type AuditLogDetailsProps = {
  log: {
    userId: string | null;
    userName: string | null;
    userEmail: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    description: string;
    metadata: unknown;
    createdAt: Date;
  };
};

export function AuditLogDetails({ log }: AuditLogDetailsProps) {
  const userLabel = log.userName ?? log.userEmail ?? log.userId ?? "System";
  const metadata =
    log.metadata === null || log.metadata === undefined
      ? "No metadata"
      : JSON.stringify(log.metadata, null, 2);

  return (
    <div className="space-y-6 rounded-xl border bg-white p-6">
      <div className="grid gap-4 text-sm md:grid-cols-2">
        <Detail label="User" value={userLabel} />
        <Detail label="Action" value={log.action} />
        <Detail label="Entity Type" value={log.entityType} />
        <Detail label="Entity ID" value={log.entityId ?? "-"} />
        <Detail label="Created" value={log.createdAt.toLocaleString()} />
      </div>

      <div>
        <p className="text-sm text-zinc-500">Description</p>
        <p className="mt-1 text-sm font-medium text-zinc-950">
          {log.description}
        </p>
      </div>

      <div>
        <p className="text-sm text-zinc-500">Metadata</p>
        <pre className="mt-2 overflow-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-50">
          {metadata}
        </pre>
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
