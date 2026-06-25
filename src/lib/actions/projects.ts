"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { documents, projects, tasks } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { hasPermission, requirePermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";
import { projectSchema, type ProjectInput } from "@/lib/validations/project";

const idSchema = z.string().uuid();
const DEFAULT_LIST_LIMIT = 50;

export async function getProjects() {
  const user = await requireUser();

  requirePermission(user, "projects:view");

  return db
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt))
    .limit(DEFAULT_LIST_LIMIT);
}

export async function getProjectById(id: string) {
  const user = await requireUser();

  requirePermission(user, "projects:view");
  const projectId = idSchema.parse(id);

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
}

export async function getProjectRelatedRecords(id: string) {
  const user = await requireUser();
  requirePermission(user, "projects:view");
  const projectId = idSchema.parse(id);
  const canViewDocuments = hasPermission(user, "documents:view");

  const [taskRows, taskStatusRows, documentRows] = await Promise.all([
    db
      .select({
        id: tasks.id,
        title: tasks.title,
        priority: tasks.priority,
        status: tasks.status,
        dueDate: tasks.dueDate,
      })
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(desc(tasks.createdAt))
      .limit(5),
    db
      .select({ status: tasks.status })
      .from(tasks)
      .where(eq(tasks.projectId, projectId)),
    canViewDocuments
      ? db
          .select({
            id: documents.id,
            fileName: documents.fileName,
            fileType: documents.fileType,
            createdAt: documents.createdAt,
          })
          .from(documents)
          .where(eq(documents.projectId, projectId))
          .orderBy(desc(documents.createdAt))
          .limit(5)
      : [],
  ]);

  return {
    tasks: taskRows,
    documents: documentRows,
    completedTasks: taskStatusRows.filter((task) => task.status === "done")
      .length,
    totalTasks: taskStatusRows.length,
    permissions: {
      canCreateTask: hasPermission(user, "tasks:create"),
      canCreateDocument: hasPermission(user, "documents:create"),
      canUpdateProject: hasPermission(user, "projects:update"),
    },
  };
}

export async function createProject(input: ProjectInput) {
  const user = await requireUser();

  requirePermission(user, "projects:create");

  const data = projectSchema.parse(input);

  const [project] = await db
    .insert(projects)
    .values({
      name: data.name,
      description: data.description,
      budget: data.budget,
      clientId: data.clientId || null,
      startDate: data.startDate || null,
      deadline: data.deadline || null,
      status: data.status,
      createdBy: user.id,
    })
    .returning();

  await createAuditLog({
    userId: user.id,
    action: "create",
    entityType: "project",
    entityId: project.id,
    description: `Created project ${project.name}`,
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return {
    success: true,
    data: project,
  };
}

export async function updateProject(id: string, input: ProjectInput) {
  const user = await requireUser();

  requirePermission(user, "projects:update");

  const projectId = idSchema.parse(id);
  const data = projectSchema.parse(input);

  const [project] = await db
    .update(projects)
    .set({
      name: data.name,
      description: data.description,
      budget: data.budget,
      clientId: data.clientId || null,
      startDate: data.startDate || null,
      deadline: data.deadline || null,
      status: data.status,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();

  if (!project) {
    throw new Error("Project not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "update",
    entityType: "project",
    entityId: project.id,
    description: `Updated project ${project.name}`,
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return {
    success: true,
    data: project,
  };
}
