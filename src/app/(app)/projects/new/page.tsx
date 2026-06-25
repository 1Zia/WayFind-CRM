import { ProjectForm } from "@/components/projects/project-form";
import { getClients } from "@/lib/actions/clients";

export default async function NewProjectPage() {
  const clients = await getClients();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">New Project</h1>
        <p className="mt-1 text-sm text-zinc-500">Create a new project.</p>
      </div>

      <ProjectForm clients={clients} />
    </>
  );}


