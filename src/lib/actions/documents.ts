"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { clients, documents, projects, users } from "@/db/schema";
import { createAuditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { hasPermission, requirePermission } from "@/lib/permissions";
import {
  documentSchema,
  type DocumentInput,
} from "@/lib/validations/document";

const idSchema = z.string().uuid();
const DEFAULT_LIST_LIMIT = 50;

function nullable(value?: string) {
  return value || null;
}

function revalidateDocumentPaths(id?: string) {
  revalidatePath("/documents");

  if (id) {
    revalidatePath(`/documents/${id}`);
    revalidatePath(`/documents/${id}/edit`);
  }
}

export async function getDocumentOptions() {
  const user = await requireUser();
  requirePermission(user, "documents:view");

  const [clientOptions, projectOptions] = await Promise.all([
    db
      .select({
        id: clients.id,
        name: clients.companyName,
      })
      .from(clients)
      .orderBy(desc(clients.createdAt)),
    db
      .select({
        id: projects.id,
        name: projects.name,
      })
      .from(projects)
      .orderBy(desc(projects.createdAt)),
  ]);

  return {
    clients: clientOptions,
    projects: projectOptions,
    canCreate: hasPermission(user, "documents:create"),
    canUpdate: hasPermission(user, "documents:update"),
    canDelete: hasPermission(user, "documents:delete"),
  };
}

export async function getDocuments() {
  const user = await requireUser();
  requirePermission(user, "documents:view");

  return db
    .select({
      id: documents.id,
      fileName: documents.fileName,
      fileUrl: documents.fileUrl,
      fileType: documents.fileType,
      fileSize: documents.fileSize,
      description: documents.description,
      clientId: documents.clientId,
      projectId: documents.projectId,
      uploadedBy: documents.uploadedBy,
      uploadedByName: users.name,
      uploadedByEmail: users.email,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .leftJoin(users, eq(documents.uploadedBy, users.id))
    .orderBy(desc(documents.createdAt))
    .limit(DEFAULT_LIST_LIMIT);
}

export async function getDocumentById(id: string) {
  const user = await requireUser();
  requirePermission(user, "documents:view");
  const documentId = idSchema.parse(id);

  const [document] = await db
    .select({
      id: documents.id,
      fileName: documents.fileName,
      fileUrl: documents.fileUrl,
      fileType: documents.fileType,
      fileSize: documents.fileSize,
      description: documents.description,
      clientId: documents.clientId,
      projectId: documents.projectId,
      uploadedBy: documents.uploadedBy,
      uploadedByName: users.name,
      uploadedByEmail: users.email,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .leftJoin(users, eq(documents.uploadedBy, users.id))
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!document) {
    throw new Error("Document not found");
  }

  return document;
}

export async function createDocument(input: DocumentInput) {
  const user = await requireUser();
  requirePermission(user, "documents:create");

  const data = documentSchema.parse(input);

  const [document] = await db
    .insert(documents)
    .values({
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      fileSize: data.fileSize,
      description: data.description || null,
      clientId: nullable(data.clientId),
      projectId: nullable(data.projectId),
      uploadedBy: user.id,
    })
    .returning();

  await createAuditLog({
    userId: user.id,
    action: "create",
    entityType: "document",
    entityId: document.id,
    description: `Uploaded document ${document.fileName}`,
  });

  revalidateDocumentPaths(document.id);

  return {
    success: true,
    data: document,
  };
}

export async function updateDocument(id: string, input: DocumentInput) {
  const user = await requireUser();
  requirePermission(user, "documents:update");

  const documentId = idSchema.parse(id);
  const data = documentSchema.parse(input);

  const [document] = await db
    .update(documents)
    .set({
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      fileSize: data.fileSize,
      description: data.description || null,
      clientId: nullable(data.clientId),
      projectId: nullable(data.projectId),
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId))
    .returning();

  if (!document) {
    throw new Error("Document not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "update",
    entityType: "document",
    entityId: document.id,
    description: `Updated document metadata ${document.fileName}`,
  });

  revalidateDocumentPaths(document.id);

  return {
    success: true,
    data: document,
  };
}

export async function deleteDocument(id: string) {
  const user = await requireUser();
  requirePermission(user, "documents:delete");
  const documentId = idSchema.parse(id);

  const [document] = await db
    .delete(documents)
    .where(eq(documents.id, documentId))
    .returning();

  if (!document) {
    throw new Error("Document not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "delete",
    entityType: "document",
    entityId: document.id,
    description: `Deleted document metadata ${document.fileName}`,
  });

  revalidateDocumentPaths(document.id);

  return {
    success: true,
  };
}
