import { LeadForm } from "@/components/leads/lead-form";
import { ForbiddenState } from "@/components/shared/forbidden-state";
import { requireUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

export default async function NewLeadPage() {
  try {
    const user = await requireUser();
    requirePermission(user, "leads:create");
  } catch {
    return <ForbiddenState />;
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
