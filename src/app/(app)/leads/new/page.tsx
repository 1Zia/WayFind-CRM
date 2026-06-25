import { LeadForm } from "@/components/leads/lead-form";
import { requireUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

export default async function NewLeadPage() {
  try {
    const user = await requireUser();
    requirePermission(user, "leads:create");
  } catch {
    return <ForbiddenMessage />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">New Lead</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Add a potential client to the sales pipeline.
        </p>
      </div>

      <LeadForm />
    </>
  );
}

function ForbiddenMessage() {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Leads access required
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Only super admins and project managers can create leads.
      </p>
    </div>
  );
}
