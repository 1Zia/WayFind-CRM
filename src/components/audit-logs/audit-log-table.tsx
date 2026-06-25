import Link from "next/link";

type AuditLog = {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  createdAt: Date;
};

type AuditLogTableProps = {
  logs: AuditLog[];
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

export function AuditLogTable({ logs }: AuditLogTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-zinc-50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Action</th>
            <th className="px-4 py-3 font-medium">Entity Type</th>
            <th className="px-4 py-3 font-medium">Description</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium">Action</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => {
            const entityHref = getEntityHref(log.entityType, log.entityId);

            return (
              <tr key={log.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">
                    {log.userName ?? log.userId ?? "System"}
                  </div>
                  {log.userEmail ? (
                    <div className="text-xs text-zinc-500">{log.userEmail}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3">
                  {entityHref ? (
                    <Link
                      href={entityHref}
                      className="text-purple-600 hover:underline"
                    >
                      {log.entityType}
                    </Link>
                  ) : (
                    log.entityType
                  )}
                </td>
                <td className="px-4 py-3">{log.description}</td>
                <td className="px-4 py-3">{log.createdAt.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/audit-logs/${log.id}`}
                    className="text-purple-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}

          {logs.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                <div className="font-medium text-zinc-950">
                  No audit logs yet.
                </div>
                <div className="mt-1 text-sm">
                  System activity will appear here after changes are made.
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
