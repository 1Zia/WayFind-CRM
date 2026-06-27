"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { projects, sprints, tasks, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { hasPermission, requirePermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";
import { createSystemNotification } from "@/lib/actions/notifications";
import { taskSchema, type TaskInput } from "@/lib/validations/task";

const idSchema = z.string().uuid();
const taskStatusSchema = z.enum(["todo", "in_progress", "testing", "done"]);
const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
const taskTypeSchema = z.enum([
  "feature",
  "bug",
  "improvement",
  "research",
  "testing",
  "other",
]);
const optionPermissionSchema = z.enum(["tasks:create", "tasks:update"]);
const DEFAULT_LIST_LIMIT = 50;
const BOARD_LIST_LIMIT = 200;

type TaskBoardView = "backlog" | "kanban" | "active-sprint" | "all-sprints";

type TaskBoardFilters = {
  view?: TaskBoardView;
  search?: string;
  assigneeId?: string;
  status?: "todo" | "in_progress" | "testing" | "done";
};

async function getTaskOptions() {
  const [projectOptions, userOptions, sprintOptions] = await Promise.all([
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
    db
      .select({
        id: sprints.id,
        name: sprints.name,
        status: sprints.status,
        startDate: sprints.startDate,
        endDate: sprints.endDate,
      })
      .from(sprints)
      .orderBy(desc(sprints.createdAt)),
  ]);

  return {
    projects: projectOptions,
    users: userOptions,
    sprints: sprintOptions,
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
    canManageSprints: hasPermission(user, "tasks:update"),
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

export async function getTaskBoardData(filters: TaskBoardFilters = {}) {
  const user = await requireUser();
  const canViewAllTasks = hasPermission(user, "tasks:view");
  const canViewAssignedTasks = hasPermission(user, "tasks:view_assigned");

  if (!canViewAllTasks && !canViewAssignedTasks) {
    throw new Error("Forbidden");
  }

  const search = filters.search?.trim();
  const whereClauses = [];

  if (!canViewAllTasks) {
    whereClauses.push(eq(tasks.assignedTo, user.id));
  }

  if (filters.assigneeId) {
    whereClauses.push(eq(tasks.assignedTo, idSchema.parse(filters.assigneeId)));
  }

  if (filters.status) {
    whereClauses.push(eq(tasks.status, taskStatusSchema.parse(filters.status)));
  }

  if (search && search.length >= 2) {
    const pattern = `%${search}%`;
    whereClauses.push(
      or(
        ilike(tasks.title, pattern),
        ilike(tasks.description, pattern),
        ilike(tasks.taskCode, pattern),
        ilike(tasks.epic, pattern),
      ),
    );
  }

  const [taskRows, options] = await Promise.all([
    db
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
        sprintId: tasks.sprintId,
        title: tasks.title,
        description: tasks.description,
        assignedTo: tasks.assignedTo,
        priority: tasks.priority,
        type: tasks.type,
        taskCode: tasks.taskCode,
        estimatePoints: tasks.estimatePoints,
        epic: tasks.epic,
        githubLink: tasks.githubLink,
        dueDate: tasks.dueDate,
        status: tasks.status,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
      .orderBy(desc(tasks.createdAt))
      .limit(BOARD_LIST_LIMIT),
    getTaskOptions(),
  ]);

  return {
    tasks: taskRows,
    ...options,
    permissions: {
      canCreateTask: hasPermission(user, "tasks:create"),
      canUpdateTask: hasPermission(user, "tasks:update"),
      canAssignTask: hasPermission(user, "tasks:assign"),
      canManageSprints: hasPermission(user, "tasks:update"),
      canUpdateAssignedStatus: hasPermission(user, "tasks:update_assigned"),
    },
    currentUserId: user.id,
  };
}

export async function getTasks() {
  const user = await requireUser();

  if (user.role === "employee") {
    return db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedTo, user.id))
      .orderBy(desc(tasks.createdAt))
      .limit(DEFAULT_LIST_LIMIT);
  }

  requirePermission(user, "tasks:view");

  return db.select().from(tasks).orderBy(desc(tasks.createdAt)).limit(DEFAULT_LIST_LIMIT);
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
      sprintId: data.sprintId || null,
      assignedTo: data.assignedTo || null,
      priority: data.priority,
      type: data.type,
      taskCode: data.taskCode || null,
      estimatePoints: data.estimatePoints,
      epic: data.epic || null,
      githubLink: data.githubLink || null,
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
  revalidatePath("/reports");

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
  revalidatePath("/reports");

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
  const existingTask = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });

  if (!existingTask) {
    throw new Error("Task not found");
  }

  const [task] = await db
    .update(tasks)
    .set({
      title: data.title,
      description: data.description,
      projectId: data.projectId || null,
      sprintId: data.sprintId || null,
      assignedTo: data.assignedTo || null,
      priority: data.priority,
      type: data.type,
      taskCode: data.taskCode || null,
      estimatePoints: data.estimatePoints,
      epic: data.epic || null,
      githubLink: data.githubLink || null,
      dueDate: data.dueDate || null,
      status: data.status,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId))
    .returning();

  await createAuditLog({
    userId: user.id,
    action: "update",
    entityType: "task",
    entityId: task.id,
    description: `Updated task ${task.title}`,
  });

  if (task.assignedTo && task.assignedTo !== existingTask.assignedTo) {
    await createSystemNotification({
      userId: task.assignedTo,
      title: "New task assigned",
      message: `You have been assigned a new task: ${task.title}`,
      type: "task_assigned",
    });

    revalidatePath("/notifications");
  }

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return {
    success: true,
    data: task,
  };
}

export async function updateTaskPriority(
  id: string,
  priority: "low" | "medium" | "high" | "urgent",
) {
  const user = await requireUser();
  requirePermission(user, "tasks:update");

  const taskId = idSchema.parse(id);
  const nextPriority = taskPrioritySchema.parse(priority);
  const [task] = await db
    .update(tasks)
    .set({ priority: nextPriority, updatedAt: new Date() })
    .where(eq(tasks.id, taskId))
    .returning();

  if (!task) {
    throw new Error("Task not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "update_priority",
    entityType: "task",
    entityId: task.id,
    description: `Updated task priority to ${nextPriority}`,
  });

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/reports");

  return { success: true, data: task };
}

export async function updateTaskAssignee(id: string, assignedTo: string) {
  const user = await requireUser();
  requirePermission(user, "tasks:update");

  const taskId = idSchema.parse(id);
  const assigneeId = assignedTo ? idSchema.parse(assignedTo) : null;
  const existingTask = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });

  if (!existingTask) {
    throw new Error("Task not found");
  }

  const [task] = await db
    .update(tasks)
    .set({ assignedTo: assigneeId, updatedAt: new Date() })
    .where(eq(tasks.id, taskId))
    .returning();

  if (task.assignedTo && task.assignedTo !== existingTask.assignedTo) {
    await createSystemNotification({
      userId: task.assignedTo,
      title: "New task assigned",
      message: `You have been assigned a new task: ${task.title}`,
      type: "task_assigned",
    });

    revalidatePath("/notifications");
  }

  await createAuditLog({
    userId: user.id,
    action: "update_assignee",
    entityType: "task",
    entityId: task.id,
    description: `Updated task assignee for ${task.title}`,
  });

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");

  return { success: true, data: task };
}

export async function moveTaskToSprint(id: string, sprintId: string) {
  const user = await requireUser();
  requirePermission(user, "tasks:update");

  const taskId = idSchema.parse(id);
  const nextSprintId = sprintId ? idSchema.parse(sprintId) : null;
  const [task] = await db
    .update(tasks)
    .set({ sprintId: nextSprintId, updatedAt: new Date() })
    .where(eq(tasks.id, taskId))
    .returning();

  if (!task) {
    throw new Error("Task not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "move_sprint",
    entityType: "task",
    entityId: task.id,
    description: `Moved task ${task.title} to ${nextSprintId ? "a sprint" : "backlog"}`,
  });

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return { success: true, data: task };
}

export async function updateTaskEstimate(id: string, estimatePoints: number) {
  const user = await requireUser();
  requirePermission(user, "tasks:update");

  const taskId = idSchema.parse(id);
  const points = z.coerce.number().int().min(0).max(100).parse(estimatePoints);
  const [task] = await db
    .update(tasks)
    .set({ estimatePoints: points, updatedAt: new Date() })
    .where(eq(tasks.id, taskId))
    .returning();

  if (!task) {
    throw new Error("Task not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "update_estimate",
    entityType: "task",
    entityId: task.id,
    description: `Updated task estimate to ${points} SP`,
  });

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/reports");

  return { success: true, data: task };
}

export async function updateTaskType(
  id: string,
  type: "feature" | "bug" | "improvement" | "research" | "testing" | "other",
) {
  const user = await requireUser();
  requirePermission(user, "tasks:update");

  const taskId = idSchema.parse(id);
  const nextType = taskTypeSchema.parse(type);
  const [task] = await db
    .update(tasks)
    .set({ type: nextType, updatedAt: new Date() })
    .where(eq(tasks.id, taskId))
    .returning();

  if (!task) {
    throw new Error("Task not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "update_type",
    entityType: "task",
    entityId: task.id,
    description: `Updated task type to ${nextType}`,
  });

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);

  return { success: true, data: task };
}
