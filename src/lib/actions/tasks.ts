"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { projects, tasks, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { hasPermission, requirePermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";
import { createSystemNotification } from "@/lib/actions/notifications";
import { taskSchema, type TaskInput } from "@/lib/validations/task";

const idSchema = z.string().uuid();
const taskStatusSchema = z.enum(["todo", "in_progress", "testing", "done"]);
const optionPermissionSchema = z.enum(["tasks:create", "tasks:update"]);

async function getTaskOptions() {
  const [projectOptions, userOptions] = await Promise.all([
    db
      .select({
        id: projects.id,
        name: projects.name,
      })
      .from(projects)
      .orderBy(desc(projects.createdAt)),
    db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .where(eq(users.status, "active"))
      .orderBy(desc(users.createdAt)),
  ]);

  return {
    projects: projectOptions,
    users: userOptions,
  };
}

export async function getTaskDisplayOptions() {
  const user = await requireUser();

  if (user.role !== "employee") {
    requirePermission(user, "tasks:view");
  }

  return {
    ...(await getTaskOptions()),
    canCreateTask: hasPermission(user, "tasks:create"),
    canUpdateTask: hasPermission(user, "tasks:update"),
  };
}

export async function getTaskFormOptions(
  permission: "tasks:create" | "tasks:update" = "tasks:create",
) {
  const user = await requireUser();
  const requiredPermission = optionPermissionSchema.parse(permission);

  requirePermission(user, requiredPermission);

  return getTaskOptions();
}

export async function getTasks() {
  const user = await requireUser();

  if (user.role === "employee") {
    return db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedTo, user.id))
      .orderBy(desc(tasks.createdAt));
  }

  requirePermission(user, "tasks:view");

  return db.select().from(tasks).orderBy(desc(tasks.createdAt));
}

export async function getTaskById(id: string) {
  const user = await requireUser();
  const taskId = idSchema.parse(id);

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (user.role === "employee" && task.assignedTo !== user.id) {
    throw new Error("Forbidden");
  }

  return task;
}

export async function createTask(input: TaskInput) {
  const user = await requireUser();

  requirePermission(user, "tasks:create");

  const data = taskSchema.parse(input);

  const [task] = await db
    .insert(tasks)
    .values({
      title: data.title,
      description: data.description,
      projectId: data.projectId || null,
      assignedTo: data.assignedTo || null,
      priority: data.priority,
      dueDate: data.dueDate || null,
      status: data.status,
      createdBy: user.id,
    })
    .returning();

  await createAuditLog({
    userId: user.id,
    action: "create",
    entityType: "task",
    entityId: task.id,
    description: `Created task ${task.title}`,
  });

  if (task.assignedTo) {
    await createSystemNotification({
      userId: task.assignedTo,
      title: "New task assigned",
      message: `You have been assigned a new task: ${task.title}`,
      type: "task_assigned",
    });
  }

  revalidatePath("/notifications");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");

  return {
    success: true,
    data: task,
  };
}

export async function updateTaskStatus(
  id: string,
  status: "todo" | "in_progress" | "testing" | "done",
) {
  const user = await requireUser();
  const taskId = idSchema.parse(id);
  const nextStatus = taskStatusSchema.parse(status);

  const existingTask = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });

  if (!existingTask) {
    throw new Error("Task not found");
  }

  const isAssignedEmployee = existingTask.assignedTo === user.id;

  if (!isAssignedEmployee) {
    requirePermission(user, "tasks:update");
  }

  const [updatedTask] = await db
    .update(tasks)
    .set({
      status: nextStatus,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId))
    .returning();

  await createAuditLog({
    userId: user.id,
    action: "update_status",
    entityType: "task",
    entityId: existingTask.id,
    description: `Updated task status to ${nextStatus}`,
  });

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    data: updatedTask,
  };
}

export async function updateTask(id: string, input: TaskInput) {
  const user = await requireUser();

  requirePermission(user, "tasks:update");

  const taskId = idSchema.parse(id);
  const data = taskSchema.parse(input);

  const [task] = await db
    .update(tasks)
    .set({
      title: data.title,
      description: data.description,
      projectId: data.projectId || null,
      assignedTo: data.assignedTo || null,
      priority: data.priority,
      dueDate: data.dueDate || null,
      status: data.status,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId))
    .returning();

  if (!task) {
    throw new Error("Task not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "update",
    entityType: "task",
    entityId: task.id,
    description: `Updated task ${task.title}`,
  });

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    data: task,
  };
}
