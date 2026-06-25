import Link from "next/link";

import { ForbiddenState } from "@/components/shared/forbidden-state";
import { getClients } from "@/lib/actions/clients";
import { getProjectById } from "@/lib/actions/projects";
import { requireUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  let data;

  try {
    data = await Promise.all([
      getProjectById(params.projectId),
      getClients(),
      requireUser(),
    ]);
  } catch {
    return <ForbiddenState />;
  }

  const [project, clients, user] = data;
  const client = clients.find((item) => item.id === project.clientId);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Project details</p>
        </div>

        {hasPermission(user, "projects:update") ? (
          <Link
            href={`/projects/${project.id}/edit`}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Edit
          </Link>
        ) : null}
      </div>

      <div className="rounded-xl border bg-white p-6">
        <p className="mb-2 text-sm text-zinc-500">Description</p>
        <div className="mb-4">{project.description ?? "-"}</div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-zinc-500">Client</p>
            <div>{client?.companyName ?? project.clientId ?? "-"}</div>
          </div>

          <div>
            <p className="text-zinc-500">Budget</p>
            <div>{project.budget ?? "-"}</div>
          </div>

          <div>
            <p className="text-zinc-500">Start Date</p>
            <div>{project.startDate ?? "-"}</div>
          </div>

          <div>
            <p className="text-zinc-500">Deadline</p>
            <div>{project.deadline ?? "-"}</div>
          </div>

          <div>
            <p className="text-zinc-500">Status</p>
            <div className="capitalize">{project.status}</div>
          </div>
        </div>
      </div>
    </>
  );
}
