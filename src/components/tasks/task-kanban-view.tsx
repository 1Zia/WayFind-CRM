import Link from "next/link";

import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { TaskTypeBadge } from "@/components/tasks/task-type-badge";

type TaskRow = {
  id: string;
  projectId: string | null;
  title: string;
  assignedTo: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  type: "feature" | "bug" | "improvement" | "research" | "testing" | "other";
  taskCode: string | null;
  dueDate: string | null;
  status: "todo" | "in_progress" | "testing" | "done";
};

type Option = {
  id: string;
  name: string;
};

const columns = [
  { status: "todo", title: "Todo" },
  { status: "in_progress", title: "In Progress" },
  { status: "testing", title: "Testing" },
  { status: "done", title: "Done" },
] as const;

export function TaskKanbanView({
  projects,
  tasks,
  users,
}: {
  projects: Option[];
  tasks: TaskRow[];
  users: Option[];
}) {
  const projectNames = new Map(projects.map((project) => [project.id, project.name]));
  const userNames = new Map(users.map((user) => [user.id, user.name]));

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.status);

        return (
          <section key={column.status} className="rounded-xl border bg-white">
            <div className="border-b px-4 py-3">
              <h2 className="font-semibold text-zinc-950">{column.title}</h2>
              <p className="mt-1 text-xs text-zinc-500">
                {columnTasks.length} task{columnTasks.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="space-y-3 p-3">
              {columnTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="block rounded-lg border p-3 hover:border-purple-200 hover:bg-purple-50/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium text-zinc-950">
                      {task.title}
                    </h3>
                    <TaskPriorityBadge priority={task.priority} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <TaskTypeBadge type={task.type} />
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                      {task.taskCode ?? `TASK-${task.id.slice(0, 4).toUpperCase()}`}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-zinc-500">
                    <p>{task.projectId ? projectNames.get(task.projectId) ?? "-" : "No project"}</p>
                    <p>{task.assignedTo ? userNames.get(task.assignedTo) ?? "Assigned" : "Unassigned"}</p>
                    <p>{task.dueDate ? `Due ${task.dueDate}` : "No due date"}</p>
                  </div>
                </Link>
              ))}

              {columnTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-zinc-500">
                  No tasks.
                </div>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
