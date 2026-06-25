import Link from "next/link";

import { AuditLogDetails } from "@/components/audit-logs/audit-log-details";
import { getAuditLogById } from "@/lib/actions/audit-logs";

export default async function AuditLogPage({
  params,
}: {
  params: { auditLogId: string };
}) {
  let log;

  try {
    log = await getAuditLogById(params.auditLogId);
  } catch {
    return <ForbiddenMessage />;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Audit Log Detail
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Review one system activity record.
          </p>
        </div>

        <Link
          href="/audit-logs"
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <AuditLogDetails log={log} />
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
