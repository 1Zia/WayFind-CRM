"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { SprintActionButtons } from "@/components/tasks/sprint-action-buttons";
import { TaskBoardToolbar } from "@/components/tasks/task-board-toolbar";
import type {
  TaskGroupOption,
  TaskSortOption,
} from "@/components/tasks/task-board-toolbar";
import { TaskGroupTable, type TaskColumnKey } from "@/components/tasks/task-group-table";
import { TaskKanbanView } from "@/components/tasks/task-kanban-view";
import { TaskSprintSection } from "@/components/tasks/task-sprint-section";

type TaskBoardView = "backlog" | "kanban" | "active-sprint" | "all-sprints";
type TaskStatus = "todo" | "in_progress" | "testing" | "done";
type TaskPriority = "low" | "medium" | "high" | "urgent";
type TaskType = "feature" | "bug" | "improvement" | "research" | "testing" | "other";

type TaskRow = {
  id: string;
  projectId: string | null;
  sprintId: string | null;
  title: string;
  assignedTo: string | null;
  priority: TaskPriority;
  type: TaskType;
  taskCode: string | null;
  estimatePoints: number;
  epic: string | null;
  dueDate: string | null;
  status: TaskStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type Option = {
  id: string;
  name: string;
};

type SprintOption = Option & {
  status: "planned" | "active" | "completed" | "archived";
  startDate: string | null;
  endDate: string | null;
};

type TaskBoardProps = {
  activeView: TaskBoardView;
  currentUserId: string;
  permissions: {
    canCreateTask: boolean;
    canUpdateTask: boolean;
    canManageSprints: boolean;
  };
  projects: Option[];
  sprints: SprintOption[];
  tasks: TaskRow[];
  users: Option[];
};

const defaultColumns: TaskColumnKey[] = [
  "actions",
  "assignee",
  "status",
  "priority",
  "type",
  "taskId",
  "estimate",
  "project",
  "sprint",
  "dueDate",
];

const priorityRank: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const statusRank: Record<TaskStatus, number> = {
  todo: 1,
  in_progress: 2,
  testing: 3,
  done: 4,
};

const columnStorageKey = "wayfind:task-board-columns";

export function TaskBoard({
  activeView,
  currentUserId,
  permissions,
  projects,
  sprints,
  tasks,
  users,
}: TaskBoardProps) {
  const searchParams = useSearchParams();
  const [visibleColumns, setVisibleColumns] =
    useState<TaskColumnKey[]>(defaultColumns);

  const projectNames = useMemo(
    () => new Map(projects.map((project) => [project.id, project.name])),
    [projects],
  );
  const sprintNames = useMemo(
    () => new Map(sprints.map((sprint) => [sprint.id, sprint.name])),
    [sprints],
  );
  const userNames = useMemo(
    () => new Map(users.map((user) => [user.id, user.name])),
    [users],
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(columnStorageKey);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as TaskColumnKey[];
      const validColumns = parsed.filter((column) =>
        defaultColumns.includes(column),
      );

      if (validColumns.length > 0) {
        setVisibleColumns(validColumns);
      }
    } catch {
      window.localStorage.removeItem(columnStorageKey);
    }
  }, []);

  function persistColumns(nextColumns: TaskColumnKey[]) {
    setVisibleColumns(nextColumns);
    window.localStorage.setItem(columnStorageKey, JSON.stringify(nextColumns));
  }

  function toggleColumn(column: TaskColumnKey) {
    const nextColumns = visibleColumns.includes(column)
      ? visibleColumns.filter((item) => item !== column)
      : [...visibleColumns, column];
    persistColumns(nextColumns);
  }

  function resetColumns() {
    persistColumns(defaultColumns);
  }

  const filteredAndSortedTasks = useMemo(() => {
    const status = searchParams.get("status") as TaskStatus | null;
    const priority = searchParams.get("priority") as TaskPriority | null;
    const assigneeId = searchParams.get("assigneeId");
    const projectId = searchParams.get("projectId");
    const sprintId = searchParams.get("sprintId");
    const type = searchParams.get("type") as TaskType | null;
    const overdueOnly = searchParams.get("overdue") === "1";
    const myTasksOnly = searchParams.get("mine") === "1";
    const sort = getSortOption(searchParams.get("sort"));
    const today = new Date().toISOString().slice(0, 10);

    const visibleTasks = tasks.filter((task) => {
      if (status && task.status !== status) return false;
      if (priority && task.priority !== priority) return false;
      if (assigneeId && task.assignedTo !== assigneeId) return false;
      if (projectId && task.projectId !== projectId) return false;
      if (type && task.type !== type) return false;
      if (sprintId === "backlog" && task.sprintId) return false;
      if (sprintId && sprintId !== "backlog" && task.sprintId !== sprintId) {
        return false;
      }
      if (overdueOnly && (!task.dueDate || task.dueDate >= today || task.status === "done")) {
        return false;
      }
      if (myTasksOnly && task.assignedTo !== currentUserId) return false;

      return true;
    });

    return [...visibleTasks].sort((a, b) =>
      compareTasks(a, b, sort, projectNames, userNames),
    );
  }, [currentUserId, projectNames, searchParams, tasks, userNames]);

  const activeSprints = sprints.filter((sprint) => sprint.status === "active");
  const upcomingSprints = sprints.filter((sprint) => sprint.status === "planned");
  const completedSprints = sprints.filter((sprint) => sprint.status === "completed");
  const activeSprintTasks = filteredAndSortedTasks.filter((task) =>
    activeSprints.some((sprint) => sprint.id === task.sprintId),
  );

  return (
    <div className="space-y-6">
      <TaskBoardToolbar
        canCreateSprint={permissions.canManageSprints}
        canCreateTask={permissions.canCreateTask}
        projects={projects}
        sprints={sprints}
        users={users}
        visibleColumns={visibleColumns}
        onResetColumns={resetColumns}
        onToggleColumn={toggleColumn}
      />

      {activeView === "kanban" ? (
        <TaskKanbanView
          projects={projects}
          tasks={filteredAndSortedTasks}
          users={users}
        />
      ) : null}

      {activeView === "active-sprint" ? (
        <div className="space-y-6">
          {activeSprints.length > 0 ? (
            activeSprints.map((sprint) => (
              <TaskSprintSection
                key={sprint.id}
                accent="border-emerald-500"
                canCreateTask={permissions.canCreateTask}
                canUpdateTask={permissions.canUpdateTask}
                currentUserId={currentUserId}
                dateRange={formatDateRange(sprint.startDate, sprint.endDate)}
                projects={projects}
                sprintId={sprint.id}
                sprints={sprints}
                tasks={filteredAndSortedTasks.filter(
                  (task) => task.sprintId === sprint.id,
                )}
                title={sprint.name}
                users={users}
                visibleColumns={visibleColumns}
              />
            ))
          ) : (
            <EmptyBoardMessage
              title="No active sprint"
              description="Start a planned sprint from the All Sprints view when work is ready."
            />
          )}
        </div>
      ) : null}

      {activeView === "all-sprints" ? (
        <AllSprintsTable
          canManageSprints={permissions.canManageSprints}
          sprints={sprints}
          tasks={filteredAndSortedTasks}
        />
      ) : null}

      {activeView === "backlog" ? (
        <GroupedTaskSections
          canCreateTask={permissions.canCreateTask}
          canUpdateTask={permissions.canUpdateTask}
          currentUserId={currentUserId}
          groupBy={getGroupOption(searchParams.get("group"))}
          projects={projects}
          projectNames={projectNames}
          sprintNames={sprintNames}
          sprints={sprints}
          tasks={filteredAndSortedTasks}
          users={users}
          userNames={userNames}
          visibleColumns={visibleColumns}
        />
      ) : null}

      {activeView === "kanban" && activeSprintTasks.length > 0 ? (
        <div className="crm-card p-4 text-sm text-zinc-500">
          Active sprint tasks shown in Kanban: {activeSprintTasks.length}
        </div>
      ) : null}
    </div>
  );
}

function GroupedTaskSections({
  canCreateTask,
  canUpdateTask,
  currentUserId,
  groupBy,
  projects,
  projectNames,
  sprintNames,
  sprints,
  tasks,
  users,
  userNames,
  visibleColumns,
}: {
  canCreateTask: boolean;
  canUpdateTask: boolean;
  currentUserId: string;
  groupBy: TaskGroupOption;
  projects: Option[];
  projectNames: Map<string, string>;
  sprintNames: Map<string, string>;
  sprints: SprintOption[];
  tasks: TaskRow[];
  users: Option[];
  userNames: Map<string, string>;
  visibleColumns: TaskColumnKey[];
}) {
  if (groupBy === "none") {
    return (
      <TaskSprintSection
        accent="border-zinc-400"
        canCreateTask={canCreateTask}
        canUpdateTask={canUpdateTask}
        currentUserId={currentUserId}
        projects={projects}
        sprintId={null}
        sprints={sprints}
        tasks={tasks}
        title="All Tasks"
        users={users}
        visibleColumns={visibleColumns}
      />
    );
  }

  if (groupBy === "status") {
    return (
      <div className="space-y-6">
        {(["todo", "in_progress", "testing", "done"] as TaskStatus[]).map((status) => (
          <TaskSprintSection
            key={status}
            accent={status === "done" ? "border-emerald-500" : "border-blue-500"}
            canCreateTask={canCreateTask}
            canUpdateTask={canUpdateTask}
            currentUserId={currentUserId}
            projects={projects}
            sprintId={null}
            sprints={sprints}
            tasks={tasks.filter((task) => task.status === status)}
            title={status.replace("_", " ")}
            users={users}
            visibleColumns={visibleColumns}
          />
        ))}
      </div>
    );
  }

  if (groupBy === "assignee") {
    const assigneeIds = uniqueValues(tasks.map((task) => task.assignedTo ?? "unassigned"));

    return (
      <div className="space-y-6">
        {assigneeIds.map((assigneeId) => (
          <TaskSprintSection
            key={assigneeId}
            accent="border-purple-500"
            canCreateTask={canCreateTask}
            canUpdateTask={canUpdateTask}
            currentUserId={currentUserId}
            projects={projects}
            sprintId={null}
            sprints={sprints}
            tasks={tasks.filter(
              (task) => (task.assignedTo ?? "unassigned") === assigneeId,
            )}
            title={
              assigneeId === "unassigned"
                ? "Unassigned"
                : userNames.get(assigneeId) ?? "Assigned"
            }
            users={users}
            visibleColumns={visibleColumns}
          />
        ))}
      </div>
    );
  }

  if (groupBy === "project") {
    const projectIds = uniqueValues(tasks.map((task) => task.projectId ?? "none"));

    return (
      <div className="space-y-6">
        {projectIds.map((projectId) => (
          <TaskSprintSection
            key={projectId}
            accent="border-amber-500"
            canCreateTask={canCreateTask}
            canUpdateTask={canUpdateTask}
            currentUserId={currentUserId}
            projects={projects}
            sprintId={null}
            sprints={sprints}
            tasks={tasks.filter((task) => (task.projectId ?? "none") === projectId)}
            title={
              projectId === "none"
                ? "No Project"
                : projectNames.get(projectId) ?? "Project"
            }
            users={users}
            visibleColumns={visibleColumns}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sprints
        .filter((sprint) => sprint.status === "active")
        .map((sprint) => (
          <TaskSprintSection
            key={sprint.id}
            accent="border-emerald-500"
            canCreateTask={canCreateTask}
            canUpdateTask={canUpdateTask}
            currentUserId={currentUserId}
            dateRange={formatDateRange(sprint.startDate, sprint.endDate)}
            projects={projects}
            sprintId={sprint.id}
            sprints={sprints}
            tasks={tasks.filter((task) => task.sprintId === sprint.id)}
            title={sprint.name}
            users={users}
            visibleColumns={visibleColumns}
          />
        ))}

      {sprints
        .filter((sprint) => sprint.status === "planned")
        .map((sprint) => (
          <TaskSprintSection
            key={sprint.id}
            accent="border-blue-500"
            canCreateTask={canCreateTask}
            canUpdateTask={canUpdateTask}
            currentUserId={currentUserId}
            dateRange={formatDateRange(sprint.startDate, sprint.endDate)}
            projects={projects}
            sprintId={sprint.id}
            sprints={sprints}
            tasks={tasks.filter((task) => task.sprintId === sprint.id)}
            title={sprint.name}
            users={users}
            visibleColumns={visibleColumns}
          />
        ))}

      <TaskSprintSection
        accent="border-zinc-300"
        canCreateTask={canCreateTask}
        canUpdateTask={canUpdateTask}
        currentUserId={currentUserId}
        projects={projects}
        sprintId={null}
        sprints={sprints}
        tasks={tasks.filter((task) => !task.sprintId)}
        title="Backlog / No Sprint"
        users={users}
        visibleColumns={visibleColumns}
      />

      {sprints
        .filter((sprint) => sprint.status === "completed")
        .map((sprint) => (
          <TaskSprintSection
            key={sprint.id}
            accent="border-slate-400"
            canCreateTask={canCreateTask}
            canUpdateTask={canUpdateTask}
            currentUserId={currentUserId}
            dateRange={formatDateRange(sprint.startDate, sprint.endDate)}
            projects={projects}
            sprintId={sprint.id}
            sprints={sprints}
            tasks={tasks.filter((task) => task.sprintId === sprint.id)}
            title={`Completed - ${sprint.name}`}
            users={users}
            visibleColumns={visibleColumns}
          />
        ))}

      {sprints.length === 0 && tasks.length === 0 ? (
        <EmptyBoardMessage
          title="No tasks match your current filters."
          description="Clear filters or create a task to start planning work."
        />
      ) : null}
    </div>
  );
}

function AllSprintsTable({
  canManageSprints,
  sprints,
  tasks,
}: {
  canManageSprints: boolean;
  sprints: SprintOption[];
  tasks: TaskRow[];
}) {
  return (
    <div className="crm-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="crm-table-head text-left text-xs">
          <tr>
            <th className="px-4 py-3 font-medium">Sprint</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Date range</th>
            <th className="px-4 py-3 font-medium">Tasks</th>
            <th className="px-4 py-3 font-medium">Completed</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sprints.map((sprint) => {
            const sprintTasks = tasks.filter((task) => task.sprintId === sprint.id);
            const completedTasks = sprintTasks.filter((task) => task.status === "done").length;

            return (
              <tr key={sprint.id} className="crm-table-row">
                <td className="px-4 py-3 font-medium">{sprint.name}</td>
                <td className="px-4 py-3 capitalize">{sprint.status}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {formatDateRange(sprint.startDate, sprint.endDate)}
                </td>
                <td className="px-4 py-3">{sprintTasks.length}</td>
                <td className="px-4 py-3">{completedTasks}</td>
                <td className="px-4 py-3">
                  {canManageSprints ? (
                    <SprintActionButtons
                      sprintId={sprint.id}
                      status={sprint.status}
                    />
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            );
          })}

          {sprints.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                No sprints yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function compareTasks(
  a: TaskRow,
  b: TaskRow,
  sort: TaskSortOption,
  projectNames: Map<string, string>,
  userNames: Map<string, string>,
) {
  switch (sort) {
    case "oldest":
      return dateValue(a.createdAt) - dateValue(b.createdAt);
    case "due_asc":
      return nullableDateValue(a.dueDate, Number.MAX_SAFE_INTEGER) -
        nullableDateValue(b.dueDate, Number.MAX_SAFE_INTEGER);
    case "due_desc":
      return nullableDateValue(b.dueDate, 0) - nullableDateValue(a.dueDate, 0);
    case "priority_desc":
      return priorityRank[b.priority] - priorityRank[a.priority];
    case "priority_asc":
      return priorityRank[a.priority] - priorityRank[b.priority];
    case "status":
      return statusRank[a.status] - statusRank[b.status];
    case "assignee":
      return compareText(
        a.assignedTo ? userNames.get(a.assignedTo) ?? "" : "",
        b.assignedTo ? userNames.get(b.assignedTo) ?? "" : "",
      );
    case "project":
      return compareText(
        a.projectId ? projectNames.get(a.projectId) ?? "" : "",
        b.projectId ? projectNames.get(b.projectId) ?? "" : "",
      );
    case "newest":
    default:
      return dateValue(b.createdAt) - dateValue(a.createdAt);
  }
}

function getSortOption(value: string | null): TaskSortOption {
  const allowed: TaskSortOption[] = [
    "newest",
    "oldest",
    "due_asc",
    "due_desc",
    "priority_desc",
    "priority_asc",
    "status",
    "assignee",
    "project",
  ];

  return allowed.includes(value as TaskSortOption)
    ? (value as TaskSortOption)
    : "newest";
}

function getGroupOption(value: string | null): TaskGroupOption {
  const allowed: TaskGroupOption[] = ["sprint", "status", "assignee", "project", "none"];

  return allowed.includes(value as TaskGroupOption)
    ? (value as TaskGroupOption)
    : "sprint";
}

function dateValue(value: Date | string) {
  return new Date(value).getTime();
}

function nullableDateValue(value: string | null, fallback: number) {
  return value ? new Date(value).getTime() : fallback;
}

function compareText(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function formatDateRange(startDate?: string | null, endDate?: string | null) {
  if (!startDate && !endDate) {
    return "Dates not set";
  }

  return [startDate, endDate].filter(Boolean).join(" - ");
}

function EmptyBoardMessage({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-crm-border bg-white p-10 text-center shadow-card">
      <h2 className="font-semibold text-zinc-950">{title}</h2>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </div>
  );
}
