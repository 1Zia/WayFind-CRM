"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { sprints, tasks } from "@/db/schema";
import { createAuditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { hasPermission, requirePermission } from "@/lib/permissions";
import { sprintSchema, type SprintInput } from "@/lib/validations/sprint";

const idSchema = z.string().uuid();

function canViewSprints(user: Awaited<ReturnType<typeof requireUser>>) {
  return (
    hasPermission(user, "tasks:view") ||
    hasPermission(user, "tasks:view_assigned")
  );
}

function requireSprintManagement(user: Awaited<ReturnType<typeof requireUser>>) {
  requirePermission(user, "tasks:update");
}

function revalidateSprintPaths(id?: string) {
  revalidatePath("/tasks");
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  if (id) {
    revalidatePath(`/tasks?sprintId=${id}`);
  }
}

export async function getSprints() {
  const user = await requireUser();

  if (!canViewSprints(user)) {
    throw new Error("Forbidden");
  }

  return db
    .select()
    .from(sprints)
    .orderBy(desc(sprints.createdAt))
    .limit(50);
}

export async function getSprintById(id: string) {
  const user = await requireUser();

  if (!canViewSprints(user)) {
    throw new Error("Forbidden");
  }

  const sprintId = idSchema.parse(id);
  const sprint = await db.query.sprints.findFirst({
    where: eq(sprints.id, sprintId),
  });

  if (!sprint) {
    throw new Error("Sprint not found");
  }

  return sprint;
}

export async function createSprint(input: SprintInput) {
  const user = await requireUser();
  requireSprintManagement(user);

  const data = sprintSchema.parse(input);
  const [sprint] = await db
    .insert(sprints)
    .values({
      name: data.name,
      description: data.description || null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      status: data.status,
      createdBy: user.id,
    })
    .returning();

  await createAuditLog({
    userId: user.id,
    action: "create",
    entityType: "sprint",
    entityId: sprint.id,
    description: `Created sprint ${sprint.name}`,
  });

  revalidateSprintPaths(sprint.id);

  return { success: true, data: sprint };
}

export async function updateSprint(id: string, input: SprintInput) {
  const user = await requireUser();
  requireSprintManagement(user);

  const sprintId = idSchema.parse(id);
  const data = sprintSchema.parse(input);
  const [sprint] = await db
    .update(sprints)
    .set({
      name: data.name,
      description: data.description || null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      status: data.status,
      updatedAt: new Date(),
    })
    .where(eq(sprints.id, sprintId))
    .returning();

  if (!sprint) {
    throw new Error("Sprint not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "update",
    entityType: "sprint",
    entityId: sprint.id,
    description: `Updated sprint ${sprint.name}`,
  });

  revalidateSprintPaths(sprint.id);

  return { success: true, data: sprint };
}

export async function deleteSprint(id: string) {
  const user = await requireUser();
  requireSprintManagement(user);

  const sprintId = idSchema.parse(id);
  const existingSprint = await db.query.sprints.findFirst({
    where: eq(sprints.id, sprintId),
  });

  if (!existingSprint) {
    throw new Error("Sprint not found");
  }

  await db
    .update(tasks)
    .set({ sprintId: null, updatedAt: new Date() })
    .where(eq(tasks.sprintId, sprintId));

  await db.delete(sprints).where(eq(sprints.id, sprintId));

  await createAuditLog({
    userId: user.id,
    action: "delete",
    entityType: "sprint",
    entityId: sprintId,
    description: `Deleted sprint ${existingSprint.name}`,
  });

  revalidateSprintPaths(sprintId);

  return { success: true };
}

export async function startSprint(id: string) {
  const user = await requireUser();
  requireSprintManagement(user);

  const sprintId = idSchema.parse(id);
  const [sprint] = await db
    .update(sprints)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(sprints.id, sprintId))
    .returning();

  if (!sprint) {
    throw new Error("Sprint not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "start",
    entityType: "sprint",
    entityId: sprint.id,
    description: `Started sprint ${sprint.name}`,
  });

  revalidateSprintPaths(sprint.id);

  return { success: true, data: sprint };
}

export async function completeSprint(id: string) {
  const user = await requireUser();
  requireSprintManagement(user);

  const sprintId = idSchema.parse(id);
  const [sprint] = await db
    .update(sprints)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(sprints.id, sprintId))
    .returning();

  if (!sprint) {
    throw new Error("Sprint not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "complete",
    entityType: "sprint",
    entityId: sprint.id,
    description: `Completed sprint ${sprint.name}`,
  });

  revalidateSprintPaths(sprint.id);

  return { success: true, data: sprint };
}
