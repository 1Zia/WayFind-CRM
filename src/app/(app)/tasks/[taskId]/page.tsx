import Link from "next/link";

import { TaskStatusForm } from "@/components/tasks/task-status-form";
import {
  getTaskById,
  getTaskDisplayOptions,
} from "@/lib/actions/tasks";

export default async function TaskPage({
  params,
}: {
  params: { taskId: string };
}) {
  const [task, options] = await Promise.all([
    getTaskById(params.taskId),
    getTaskDisplayOptions(),
  ]);

  const project = options.projects.find((item) => item.id === task.projectId);
  const assignedUser = options.users.find((item) => item.id === task.assignedTo);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {task.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Task details</p>
        </div>

        {options.canUpdateTask ? (
          <Link
            href={`/tasks/${task.id}/edit`}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Edit
          </Link>
        ) : null}
      </div>

      <div className="rounded-xl border bg-white p-6">
        <p className="mb-2 text-sm text-zinc-500">Description</p>
        <div className="mb-4">{task.description ?? "-"}</div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-zinc-500">Project</p>
            <div>{project?.name ?? task.projectId ?? "-"}</div>
          </div>

          <div>
            <p className="text-zinc-500">Assigned To</p>
            <div>{assignedUser?.name ?? task.assignedTo ?? "-"}</div>
          </div>

          <div>
            <p className="text-zinc-500">Priority</p>
            <div className="capitalize">{task.priority}</div>
          </div>

          <div>
            <p className="text-zinc-500">Due Date</p>
            <div>{task.dueDate ?? "-"}</div>
          </div>
        </div>

        <TaskStatusForm status={task.status} taskId={task.id} />
      </div>
    </>
  );}


