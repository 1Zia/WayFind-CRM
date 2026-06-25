import Link from "next/link";

import { getTaskDisplayOptions, getTasks } from "@/lib/actions/tasks";

export default async function TasksPage() {
  const [tasks, options] = await Promise.all([
    getTasks(),
    getTaskDisplayOptions(),
  ]);

  const projectNames = new Map(
    options.projects.map((project) => [project.id, project.name]),
  );
  const userNames = new Map(options.users.map((user) => [user.id, user.name]));

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track assigned work and project tasks.
          </p>
        </div>

        {options.canCreateTask ? (
          <Link
            href="/tasks/new"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            New Task
          </Link>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-zinc-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Assigned To</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{task.title}</td>
                <td className="px-4 py-3">
                  {task.projectId
                    ? projectNames.get(task.projectId) ?? task.projectId
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  {task.assignedTo
                    ? userNames.get(task.assignedTo) ?? task.assignedTo
                    : "-"}
                </td>
                <td className="px-4 py-3 capitalize">{task.priority}</td>
                <td className="px-4 py-3">{task.dueDate ?? "-"}</td>
                <td className="px-4 py-3 capitalize">
                  {task.status.replace("_", " ")}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="text-purple-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {tasks.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-zinc-500"
                >
                  <div className="font-medium text-zinc-950">
                    No tasks yet.
                  </div>
                  <div className="mt-1 text-sm">
                    Assigned and project tasks will appear here.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );}


