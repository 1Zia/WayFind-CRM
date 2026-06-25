import Link from "next/link";

type AuditLog = {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  action: string;
  entityType: string;
  description: string;
  createdAt: Date;
};

type AuditLogTableProps = {
  logs: AuditLog[];
};

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
          {logs.map((log) => (
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
              <td className="px-4 py-3">{log.entityType}</td>
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
          ))}

          {logs.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                No audit logs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
