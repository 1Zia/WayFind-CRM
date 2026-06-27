"use client";

import Link from "next/link";

import { TaskInlineAssigneeSelect } from "@/components/tasks/task-inline-assignee-select";
import { TaskInlineEstimateInput } from "@/components/tasks/task-inline-estimate-input";
import { TaskInlinePrioritySelect } from "@/components/tasks/task-inline-priority-select";
import { TaskInlineSprintSelect } from "@/components/tasks/task-inline-sprint-select";
import { TaskInlineStatusSelect } from "@/components/tasks/task-inline-status-select";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { TaskTypeBadge } from "@/components/tasks/task-type-badge";
import { QuickAddTaskRow } from "@/components/tasks/quick-add-task-row";

export type TaskColumnKey =
  | "actions"
  | "assignee"
  | "status"
  | "priority"
  | "type"
  | "taskId"
  | "estimate"
  | "project"
  | "sprint"
  | "dueDate";

type TaskRow = {
  id: string;
  projectId: string | null;
  sprintId: string | null;
  title: string;
  assignedTo: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  type: "feature" | "bug" | "improvement" | "research" | "testing" | "other";
  taskCode: string | null;
  estimatePoints: number;
  epic: string | null;
  dueDate: string | null;
  status: "todo" | "in_progress" | "testing" | "done";
};

type Option = {
  id: string;
  name: string;
};

type SprintOption = Option & {
  status: string;
};

type TaskGroupTableProps = {
  canCreateTask: boolean;
  canUpdateTask: boolean;
  currentUserId: string;
  projects: Option[];
  sprintId?: string | null;
  sprints: SprintOption[];
  tasks: TaskRow[];
  users: Option[];
  visibleColumns?: TaskColumnKey[];
};

export function TaskGroupTable({
  canCreateTask,
  canUpdateTask,
  currentUserId,
  projects,
  sprintId,
  sprints,
  tasks,
  users,
  visibleColumns = [
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
  ],
}: TaskGroupTableProps) {
  const projectNames = new Map(projects.map((project) => [project.id, project.name]));
  const visibleColumnSet = new Set(visibleColumns);
  const tableColSpan = 1 + visibleColumns.length;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1120px] w-full text-sm">
        <thead className="border-b bg-zinc-50 text-left text-xs text-zinc-500">
          <tr>
            {visibleColumnSet.has("actions") ? (
              <th className="w-36 px-3 py-3 font-medium">Actions</th>
            ) : null}
            <th className="px-3 py-3 font-medium">Task</th>
            {visibleColumnSet.has("assignee") ? (
              <th className="px-3 py-3 font-medium">Owner</th>
            ) : null}
            {visibleColumnSet.has("status") ? (
              <th className="px-3 py-3 font-medium">Status</th>
            ) : null}
            {visibleColumnSet.has("priority") ? (
              <th className="px-3 py-3 font-medium">Priority</th>
            ) : null}
            {visibleColumnSet.has("type") ? (
              <th className="px-3 py-3 font-medium">Type</th>
            ) : null}
            {visibleColumnSet.has("taskId") ? (
              <th className="px-3 py-3 font-medium">Task ID</th>
            ) : null}
            {visibleColumnSet.has("estimate") ? (
              <th className="px-3 py-3 font-medium">Estimate</th>
            ) : null}
            {visibleColumnSet.has("project") ? (
              <th className="px-3 py-3 font-medium">Project</th>
            ) : null}
            {visibleColumnSet.has("sprint") ? (
              <th className="px-3 py-3 font-medium">Sprint</th>
            ) : null}
            {visibleColumnSet.has("dueDate") ? (
              <th className="px-3 py-3 font-medium">Due</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const canUpdateStatus =
              canUpdateTask || task.assignedTo === currentUserId;

            return (
              <tr key={task.id} className="border-b last:border-0">
                {visibleColumnSet.has("actions") ? (
                  <td className="w-36 px-3 py-3 align-top">
                    <TaskInlineStatusSelect
                      disabled={!canUpdateStatus}
                      status={task.status}
                      taskId={task.id}
                    />
                  </td>
                ) : null}
                <td className="min-w-64 px-3 py-3 align-top">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="font-medium text-zinc-950 hover:text-purple-600"
                  >
                    {task.title}
                  </Link>
                  {task.epic ? (
                    <div className="mt-1 text-xs text-zinc-500">{task.epic}</div>
                  ) : null}
                </td>
                {visibleColumnSet.has("assignee") ? (
                  <td className="w-44 px-3 py-3 align-top">
                    <TaskInlineAssigneeSelect
                      assignedTo={task.assignedTo}
                      disabled={!canUpdateTask}
                      taskId={task.id}
                      users={users}
                    />
                  </td>
                ) : null}
                {visibleColumnSet.has("status") ? (
                  <td className="w-36 px-3 py-3 align-top capitalize text-zinc-700">
                    {task.status.replace("_", " ")}
                  </td>
                ) : null}
                {visibleColumnSet.has("priority") ? (
                  <td className="w-36 px-3 py-3 align-top">
                    {canUpdateTask ? (
                      <TaskInlinePrioritySelect
                        priority={task.priority}
                        taskId={task.id}
                      />
                    ) : (
                      <TaskPriorityBadge priority={task.priority} />
                    )}
                  </td>
                ) : null}
                {visibleColumnSet.has("type") ? (
                  <td className="w-32 px-3 py-3 align-top">
                    <TaskTypeBadge type={task.type} />
                  </td>
                ) : null}
                {visibleColumnSet.has("taskId") ? (
                  <td className="w-32 px-3 py-3 align-top font-mono text-xs text-zinc-600">
                    {task.taskCode ?? `TASK-${task.id.slice(0, 4).toUpperCase()}`}
                  </td>
                ) : null}
                {visibleColumnSet.has("estimate") ? (
                  <td className="w-28 px-3 py-3 align-top">
                    <TaskInlineEstimateInput
                      disabled={!canUpdateTask}
                      estimatePoints={task.estimatePoints}
                      taskId={task.id}
                    />
                  </td>
                ) : null}
                {visibleColumnSet.has("project") ? (
                  <td className="w-44 px-3 py-3 align-top text-zinc-600">
                    {task.projectId ? projectNames.get(task.projectId) ?? "-" : "-"}
                  </td>
                ) : null}
                {visibleColumnSet.has("sprint") ? (
                  <td className="w-44 px-3 py-3 align-top">
                    <TaskInlineSprintSelect
                      disabled={!canUpdateTask}
                      sprintId={task.sprintId}
                      sprints={sprints}
                      taskId={task.id}
                    />
                  </td>
                ) : null}
                {visibleColumnSet.has("dueDate") ? (
                  <td className="w-32 px-3 py-3 align-top text-zinc-600">
                    {task.dueDate ?? "-"}
                  </td>
                ) : null}
              </tr>
            );
          })}

          {tasks.length === 0 ? (
            <tr>
              <td colSpan={tableColSpan} className="px-4 py-8 text-center text-zinc-500">
                No tasks match your current filters.
              </td>
            </tr>
          ) : null}

          <QuickAddTaskRow
            colSpan={tableColSpan}
            disabled={!canCreateTask}
            projects={projects}
            sprintId={sprintId}
            users={users}
          />
        </tbody>
      </table>
    </div>
  );
}
