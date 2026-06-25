import { TaskForm } from "@/components/tasks/task-form";
import { getTaskFormOptions } from "@/lib/actions/tasks";

export default async function TasksNewPage() {
  const options = await getTaskFormOptions("tasks:create");

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">New Task</h1>
        <p className="mt-1 text-sm text-zinc-500">Create a new task.</p>
      </div>

      <TaskForm projects={options.projects} users={options.users} />
    </>
  );}


