import { TaskForm } from "@/components/tasks/task-form";
import { getTaskById, getTaskFormOptions } from "@/lib/actions/tasks";

export default async function TaskEditPage({
  params,
}: {
  params: { taskId: string };
}) {
  const [task, options] = await Promise.all([
    getTaskById(params.taskId),
    getTaskFormOptions("tasks:update"),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Task</h1>
        <p className="mt-1 text-sm text-zinc-500">Update task details.</p>
      </div>

      <TaskForm
        projects={options.projects}
        users={options.users}
        task={{
          id: task.id,
          projectId: task.projectId ?? "",
          title: task.title,
          description: task.description ?? "",
          assignedTo: task.assignedTo ?? "",
          priority: task.priority,
          dueDate: task.dueDate ?? "",
          status: task.status,
        }}
      />
    </>
  );}


