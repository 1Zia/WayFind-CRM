import Link from "next/link";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmptyRow,
  DataTableHead,
  DataTableHeadCell,
  DataTableRow,
  DataTableWrapper,
} from "@/components/shared/data-table-wrapper";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ForbiddenState } from "@/components/shared/forbidden-state";
import { getClients } from "@/lib/actions/clients";
import { getProjects } from "@/lib/actions/projects";
import { requireUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { LiquidButton } from "@/components/ui/button";

export default async function ProjectsPage() {
  let data;

  try {
    data = await Promise.all([getProjects(), getClients(), requireUser()]);
  } catch {
    return <ForbiddenState />;
  }

  const [projects, clients, user] = data;
  const clientNames = new Map(
    clients.map((client) => [client.id, client.companyName]),
  );

  return (
    <>
      <PageHeader
        title="Projects"
        description="Manage projects and work for your clients."
        action={
          hasPermission(user, "projects:create") ? (
            <LiquidButton href="/projects/new" size="default">
              New Project
            </LiquidButton>
          ) : null
        }
      />

      <DataTableWrapper>
        <DataTable>
          <DataTableHead>
            <tr>
              <DataTableHeadCell>Name</DataTableHeadCell>
              <DataTableHeadCell>Client</DataTableHeadCell>
              <DataTableHeadCell>Budget</DataTableHeadCell>
              <DataTableHeadCell>Start Date</DataTableHeadCell>
              <DataTableHeadCell>Deadline</DataTableHeadCell>
              <DataTableHeadCell>Status</DataTableHeadCell>
              <DataTableHeadCell>Action</DataTableHeadCell>
            </tr>
          </DataTableHead>

          <DataTableBody>
            {projects.map((project) => (
              <DataTableRow key={project.id}>
                <DataTableCell className="font-medium">
                  {project.name}
                </DataTableCell>
                <DataTableCell>
                  {project.clientId
                    ? clientNames.get(project.clientId) ?? project.clientId
                    : "-"}
                </DataTableCell>
                <DataTableCell>{project.budget ?? "-"}</DataTableCell>
                <DataTableCell>{project.startDate ?? "-"}</DataTableCell>
                <DataTableCell>{project.deadline ?? "-"}</DataTableCell>
                <DataTableCell>
                  <StatusBadge tone="info">{project.status}</StatusBadge>
                </DataTableCell>
                <DataTableCell>
                  <Link
                    href={`/projects/${project.id}`}
                    className="crm-action-link"
                  >
                    View
                  </Link>
                </DataTableCell>
              </DataTableRow>
            ))}

            {projects.length === 0 ? (
              <DataTableEmptyRow colSpan={7}>
                <EmptyState
                  compact
                  title="No projects yet"
                  description="Project work will appear here after it is created."
                  action={
                    hasPermission(user, "projects:create")
                      ? { label: "New Project", href: "/projects/new" }
                      : undefined
                  }
                />
              </DataTableEmptyRow>
            ) : null}
          </DataTableBody>
        </DataTable>
      </DataTableWrapper>
    </>
  );
}
