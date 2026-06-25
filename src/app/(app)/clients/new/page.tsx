import { ClientForm } from "@/components/clients/client-form";
import { ForbiddenState } from "@/components/shared/forbidden-state";
import { requireUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

export default async function NewClientPage() {
  try {
    const user = await requireUser();
    requirePermission(user, "clients:create");
  } catch {
    return <ForbiddenState />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">New Client</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Add a new company or customer to your CRM.
        </p>
      </div>

      <ClientForm />
    </>
  );
}
