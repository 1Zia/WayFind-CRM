import { LeadForm } from "@/components/leads/lead-form";
import { ForbiddenState } from "@/components/shared/forbidden-state";
import { getLeadById } from "@/lib/actions/leads";
import { requireUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

export default async function EditLeadPage({
  params,
}: {
  params: { leadId: string };
}) {
  let lead;

  try {
    const user = await requireUser();
    requirePermission(user, "leads:update");
    lead = await getLeadById(params.leadId);
  } catch {
    return <ForbiddenState />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Lead</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Update lead pipeline details.
        </p>
      </div>

      <LeadForm
        lead={{
          id: lead.id,
          leadName: lead.leadName,
          company: lead.company ?? "",
          contact: lead.contact ?? "",
          email: lead.email ?? "",
          phone: lead.phone ?? "",
          source: lead.source ?? "",
          status: lead.status,
          followUpDate: lead.followUpDate ?? "",
          notes: lead.notes ?? "",
        }}
      />
    </>
  );
}
