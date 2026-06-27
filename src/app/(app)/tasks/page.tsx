import Link from "next/link";

import { ForbiddenState } from "@/components/shared/forbidden-state";
import { TaskBoard } from "@/components/tasks/task-board";
import { getTaskBoardData } from "@/lib/actions/tasks";

type TasksPageProps = {
  searchParams?: {
    assigneeId?: string;
    search?: string;
    status?: string;
    view?: string;
  };
};

const views = [
  { label: "Backlog", value: "backlog" },
  { label: "Kanban", value: "kanban" },
  { label: "Active Sprint", value: "active-sprint" },
  { label: "All Sprints", value: "all-sprints" },
] as const;

const statusValues = ["todo", "in_progress", "testing", "done"] as const;
type TaskBoardView = (typeof views)[number]["value"];
type TaskStatusFilter = (typeof statusValues)[number];

function getSafeView(value?: string): TaskBoardView {
  return views.some((view) => view.value === value)
    ? (value as TaskBoardView)
    : "backlog";
}

function getSafeStatus(value?: string): TaskStatusFilter | undefined {
  return statusValues.some((status) => status === value)
    ? (value as TaskStatusFilter)
    : undefined;
}

function getViewHref(nextView: string, searchParams?: TasksPageProps["searchParams"]) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value && key !== "view") {
      params.set(key, value);
    }
  }

  params.set("view", nextView);

  return `/tasks?${params.toString()}`;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const activeView = getSafeView(searchParams?.view);
  const status = getSafeStatus(searchParams?.status);

  let data;

  try {
    data = await getTaskBoardData({
      assigneeId: searchParams?.assigneeId,
      search: searchParams?.search,
      status,
      view: activeView,
    });
  } catch {
    return <ForbiddenState />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Plan sprint work, manage assignments, and track delivery.
        </p>
      </div>

      <div className="border-b">
        <div className="flex flex-wrap gap-5">
          {views.map((view) => {
            const active = activeView === view.value;

            return (
              <Link
                key={view.value}
                href={getViewHref(view.value, searchParams)}
                className={
                  active
                    ? "border-b-2 border-blue-600 px-1 pb-3 text-sm font-medium text-zinc-950"
                    : "px-1 pb-3 text-sm font-medium text-zinc-500 hover:text-zinc-950"
                }
              >
                {view.label}
              </Link>
            );
          })}
        </div>
      </div>

      <TaskBoard
        activeView={activeView}
        currentUserId={data.currentUserId}
        permissions={{
          canCreateTask: data.permissions.canCreateTask,
          canUpdateTask: data.permissions.canUpdateTask,
          canManageSprints: data.permissions.canManageSprints,
        }}
        projects={data.projects}
        sprints={data.sprints}
        tasks={data.tasks}
        users={data.users}
      />
    </div>
  );
}
