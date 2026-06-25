import Link from "next/link";

import { LeadDetails } from "@/components/leads/lead-details";
import { ForbiddenState } from "@/components/shared/forbidden-state";
import { getLeadById } from "@/lib/actions/leads";
import { requireUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export default async function LeadPage({
  params,
}: {
  params: { leadId: string };
}) {
  let lead;
  let user;

  try {
    [lead, user] = await Promise.all([
      getLeadById(params.leadId),
      requireUser(),
    ]);
  } catch {
    return <ForbiddenState />;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {lead.leadName}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Lead details</p>
        </div>

        <Link
          href="/leads"
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <LeadDetails canConvert={hasPermission(user, "leads:update")} lead={lead} />
    </>
  );
}
