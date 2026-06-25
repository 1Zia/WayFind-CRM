import { AuditLogTable } from "@/components/audit-logs/audit-log-table";
import { getAuditLogs } from "@/lib/actions/audit-logs";

export default async function AuditLogsPage() {
  let logs;

  try {
    logs = await getAuditLogs();
  } catch {
    return <ForbiddenMessage />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Track user activity and system changes.
        </p>
      </div>

      <AuditLogTable logs={logs} />
    </>
  );
}

function ForbiddenMessage() {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Audit logs access required
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Only super admins can view audit logs.
      </p>
    </div>
  );
}
