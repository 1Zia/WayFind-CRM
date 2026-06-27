import { ForbiddenState } from "@/components/shared/forbidden-state";
import { TaskForm } from "@/components/tasks/task-form";
import { getTaskById, getTaskFormOptions } from "@/lib/actions/tasks";

export default async function TaskEditPage({
  params,
}: {
  params: { taskId: string };
}) {
  let data;

  try {
    data = await Promise.all([
      getTaskById(params.taskId),
      getTaskFormOptions("tasks:update"),
    ]);
  } catch {
    return <ForbiddenState />;
  }

  const [task, options] = data;

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
          sprintId: task.sprintId ?? "",
          title: task.title,
          description: task.description ?? "",
          assignedTo: task.assignedTo ?? "",
          priority: task.priority,
          type: task.type,
          taskCode: task.taskCode ?? "",
          estimatePoints: task.estimatePoints,
          epic: task.epic ?? "",
          githubLink: task.githubLink ?? "",
          dueDate: task.dueDate ?? "",
          status: task.status,
        }}
        sprints={options.sprints}
      />
    </>
  );
}
