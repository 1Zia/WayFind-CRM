import { ProjectForm } from "@/components/projects/project-form";
import { ForbiddenState } from "@/components/shared/forbidden-state";
import { getClients } from "@/lib/actions/clients";
import { getProjectById } from "@/lib/actions/projects";
import { requireUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

export default async function ProjectEditPage({
  params,
}: {
  params: { projectId: string };
}) {
  let data;

  try {
    const user = await requireUser();
    requirePermission(user, "projects:update");
    data = await Promise.all([getProjectById(params.projectId), getClients()]);
  } catch {
    return <ForbiddenState />;
  }

  const [project, clients] = data;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Project</h1>
        <p className="mt-1 text-sm text-zinc-500">Update project details.</p>
      </div>

      <ProjectForm
        clients={clients}
        project={{
          id: project.id,
          clientId: project.clientId ?? "",
          name: project.name,
          description: project.description ?? "",
          budget: project.budget,
          startDate: project.startDate ?? "",
          deadline: project.deadline ?? "",
          status: project.status,
        }}
      />
    </>
  );
}
