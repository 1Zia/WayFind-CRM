"use client";

import { TaskGroupTable } from "@/components/tasks/task-group-table";

type TaskRow = Parameters<typeof TaskGroupTable>[0]["tasks"][number];
type Option = Parameters<typeof TaskGroupTable>[0]["projects"][number];
type SprintOption = Parameters<typeof TaskGroupTable>[0]["sprints"][number];

type TaskSprintSectionProps = {
  accent?: string;
  canCreateTask: boolean;
  canUpdateTask: boolean;
  currentUserId: string;
  dateRange?: string;
  projects: Option[];
  sprintId?: string | null;
  sprints: SprintOption[];
  tasks: TaskRow[];
  title: string;
  users: Option[];
  visibleColumns?: Parameters<typeof TaskGroupTable>[0]["visibleColumns"];
};

export function TaskSprintSection({
  accent = "border-purple-500",
  canCreateTask,
  canUpdateTask,
  currentUserId,
  dateRange,
  projects,
  sprintId,
  sprints,
  tasks,
  title,
  users,
  visibleColumns,
}: TaskSprintSectionProps) {
  const totalPoints = tasks.reduce((total, task) => total + task.estimatePoints, 0);
  const completedPoints = tasks
    .filter((task) => task.status === "done")
    .reduce((total, task) => total + task.estimatePoints, 0);
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <section className={`overflow-hidden rounded-xl border-l-4 ${accent} border-y border-r bg-white`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {tasks.length} task{tasks.length === 1 ? "" : "s"}
            {dateRange ? ` · ${dateRange}` : ""} · {totalPoints} SP
          </p>
        </div>
        <div className="flex min-w-48 items-center gap-3 text-sm text-zinc-500">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-purple-600"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span>{completedPoints} SP done</span>
        </div>
      </div>

      <TaskGroupTable
        canCreateTask={canCreateTask}
        canUpdateTask={canUpdateTask}
        currentUserId={currentUserId}
        projects={projects}
        sprintId={sprintId}
        sprints={sprints}
        tasks={tasks}
        users={users}
        visibleColumns={visibleColumns}
      />
    </section>
  );
}
