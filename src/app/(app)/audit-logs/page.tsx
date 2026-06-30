import { PageHeader } from "@/components/shared/page-header";
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
      <PageHeader
        title="Audit Logs"
        description="Track user activity and system changes."
      />

      <AuditLogTable logs={logs} />
    </>
  );
}

function ForbiddenMessage() {
  return (
    <div className="crm-card p-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Audit logs access required
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Only super admins can view audit logs.
      </p>
    </div>
  );
}
