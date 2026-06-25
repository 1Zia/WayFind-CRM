import Link from "next/link";

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

function getEntityHref(entityType: string, entityId: string | null) {
  if (!entityId) {
    return null;
  }

  const routes: Record<string, string> = {
    client: `/clients/${entityId}`,
    document: `/documents/${entityId}`,
    lead: `/leads/${entityId}`,
    notification: `/notifications/${entityId}`,
    project: `/projects/${entityId}`,
    task: `/tasks/${entityId}`,
    user: `/team/users/${entityId}`,
  };

  return routes[entityType] ?? null;
}

export function AuditLogDetails({ log }: AuditLogDetailsProps) {
  const userLabel = log.userName ?? log.userEmail ?? log.userId ?? "System";
  const entityHref = getEntityHref(log.entityType, log.entityId);
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
        <div>
          <p className="text-zinc-500">Entity ID</p>
          {entityHref ? (
            <Link
              href={entityHref}
              className="mt-1 block font-medium text-purple-600 hover:underline"
            >
              {log.entityId}
            </Link>
          ) : (
            <div className="mt-1 font-medium text-zinc-950">
              {log.entityId ?? "-"}
            </div>
          )}
        </div>
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
