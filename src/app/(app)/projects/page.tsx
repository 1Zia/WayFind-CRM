import Link from "next/link";

import { getClients } from "@/lib/actions/clients";
import { getProjects } from "@/lib/actions/projects";

export default async function ProjectsPage() {
  const [projects, clients] = await Promise.all([getProjects(), getClients()]);
  const clientNames = new Map(
    clients.map((client) => [client.id, client.companyName]),
  );

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage projects and work for your clients.
          </p>
        </div>

        <Link
          href="/projects/new"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          New Project
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-zinc-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Budget</th>
              <th className="px-4 py-3 font-medium">Start Date</th>
              <th className="px-4 py-3 font-medium">Deadline</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{project.name}</td>
                <td className="px-4 py-3">
                  {project.clientId
                    ? clientNames.get(project.clientId) ?? project.clientId
                    : "-"}
                </td>
                <td className="px-4 py-3">{project.budget ?? "-"}</td>
                <td className="px-4 py-3">{project.startDate ?? "-"}</td>
                <td className="px-4 py-3">{project.deadline ?? "-"}</td>
                <td className="px-4 py-3 capitalize">{project.status}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-purple-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {projects.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-zinc-500"
                >
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}


