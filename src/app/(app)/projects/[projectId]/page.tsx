import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { ForbiddenState } from "@/components/shared/forbidden-state";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getClients } from "@/lib/actions/clients";
import {
  getProjectById,
  getProjectRelatedRecords,
} from "@/lib/actions/projects";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: Date | string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  let data;

  try {
    data = await Promise.all([
      getProjectById(params.projectId),
      getProjectRelatedRecords(params.projectId),
      getClients(),
    ]);
  } catch {
    return <ForbiddenState />;
  }

  const [project, related, clients] = data;
  const client = clients.find((item) => item.id === project.clientId);
  const progress =
    related.totalTasks > 0
      ? Math.round((related.completedTasks / related.totalTasks) * 100)
      : 0;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Project details</p>
        </div>

        {related.permissions.canUpdateProject ? (
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
            {client ? (
              <Link
                href={`/clients/${client.id}`}
                className="font-medium text-purple-600 hover:underline"
              >
                {client.companyName}
              </Link>
            ) : (
              <div>{project.clientId ?? "-"}</div>
            )}
          </div>

          <div>
            <p className="text-zinc-500">Budget</p>
            <div>{formatMoney(project.budget ?? 0)}</div>
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
            <div className="mt-1">
              <StatusBadge>{project.status}</StatusBadge>
            </div>
          </div>

          <div>
            <p className="text-zinc-500">Progress</p>
            <div className="mt-1 font-medium text-zinc-950">
              {related.completedTasks}/{related.totalTasks} tasks done (
              {progress}%)
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Quick Actions"
          description="Move project work forward from this page."
        >
          <div className="flex flex-wrap gap-2">
            {related.permissions.canCreateTask ? (
              <Link
                href="/tasks/new"
                className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-zinc-50"
              >
                New Task
              </Link>
            ) : null}
            {related.permissions.canCreateDocument ? (
              <Link
                href="/documents/new"
                className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-zinc-50"
              >
                Add Document
              </Link>
            ) : null}
            {related.permissions.canUpdateProject ? (
              <Link
                href={`/projects/${project.id}/edit`}
                className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-zinc-50"
              >
                Edit Project
              </Link>
            ) : null}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard title="Related Tasks">
          {related.tasks.length > 0 ? (
            <div className="divide-y">
              {related.tasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-zinc-500">
                      {task.priority} priority - Due {formatDate(task.dueDate)}
                    </p>
                  </div>
                  <StatusBadge>{task.status.replace("_", " ")}</StatusBadge>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No tasks yet"
              description="Tasks help your team track daily execution and responsibilities."
            />
          )}
        </SectionCard>

        <SectionCard title="Related Documents">
          {related.documents.length > 0 ? (
            <div className="divide-y">
              {related.documents.map((document) => (
                <Link
                  key={document.id}
                  href={`/documents/${document.id}`}
                  className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{document.fileName}</p>
                    <p className="text-xs text-zinc-500">
                      {document.fileType} - {formatDate(document.createdAt)}
                    </p>
                  </div>
                  <span className="text-purple-600">View</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No project documents"
              description="Attach proposals, requirements, designs, contracts, and delivery files."
            />
          )}
        </SectionCard>
      </div>
    </>
  );
}
