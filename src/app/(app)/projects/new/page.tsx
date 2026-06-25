import { ProjectForm } from "@/components/projects/project-form";
import { ForbiddenState } from "@/components/shared/forbidden-state";
import { getClients } from "@/lib/actions/clients";
import { requireUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

export default async function NewProjectPage() {
  let clients;

  try {
    const user = await requireUser();
    requirePermission(user, "projects:create");
    clients = await getClients();
  } catch {
    return <ForbiddenState />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">New Project</h1>
        <p className="mt-1 text-sm text-zinc-500">Create a new project.</p>
      </div>

      <ProjectForm clients={clients} />
    </>
  );
}
