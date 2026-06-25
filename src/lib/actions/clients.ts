"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, ilike, or, desc } from "drizzle-orm";

import { db } from "@/db";
import { clients, documents, income, invoices, projects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { hasPermission, requirePermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";
import { clientSchema, type ClientInput } from "@/lib/validations/client";

const idSchema = z.string().uuid();
const DEFAULT_LIST_LIMIT = 50;

export async function getClients(search?: string) {
  const user = await requireUser();
  requirePermission(user, "clients:view");

  if (search) {
    return db
      .select()
      .from(clients)
      .where(
        or(
          ilike(clients.companyName, `%${search}%`),
          ilike(clients.email, `%${search}%`),
          ilike(clients.phone, `%${search}%`),
        ),
      )
      .orderBy(desc(clients.createdAt))
      .limit(DEFAULT_LIST_LIMIT);
  }

  return db
    .select()
    .from(clients)
    .orderBy(desc(clients.createdAt))
    .limit(DEFAULT_LIST_LIMIT);
}

export async function getClientById(id: string) {
  const user = await requireUser();
  requirePermission(user, "clients:view");
  const clientId = idSchema.parse(id);

  const client = await db.query.clients.findFirst({
    where: eq(clients.id, clientId),
  });

  if (!client) {
    throw new Error("Client not found");
  }

  return client;
}

export async function getClientRelatedRecords(id: string) {
  const user = await requireUser();
  requirePermission(user, "clients:view");
  const clientId = idSchema.parse(id);
  const canViewFinance = hasPermission(user, "finance:view");

  const [projectRows, documentRows, incomeRows, invoiceRows] =
    await Promise.all([
      db
        .select({
          id: projects.id,
          name: projects.name,
          status: projects.status,
          deadline: projects.deadline,
        })
        .from(projects)
        .where(eq(projects.clientId, clientId))
        .orderBy(desc(projects.createdAt))
        .limit(5),
      db
        .select({
          id: documents.id,
          fileName: documents.fileName,
          fileType: documents.fileType,
          createdAt: documents.createdAt,
        })
        .from(documents)
        .where(eq(documents.clientId, clientId))
        .orderBy(desc(documents.createdAt))
        .limit(5),
      canViewFinance
        ? db
            .select({
              id: income.id,
              amount: income.amount,
              status: income.status,
              paymentDate: income.paymentDate,
            })
            .from(income)
            .where(eq(income.clientId, clientId))
            .orderBy(desc(income.createdAt))
            .limit(5)
        : [],
      canViewFinance
        ? db
            .select({
              id: invoices.id,
              invoiceNumber: invoices.invoiceNumber,
              amount: invoices.amount,
              status: invoices.status,
              dueDate: invoices.dueDate,
            })
            .from(invoices)
            .where(eq(invoices.clientId, clientId))
            .orderBy(desc(invoices.createdAt))
            .limit(5)
        : [],
    ]);

  return {
    projects: projectRows,
    documents: documentRows,
    income: incomeRows,
    invoices: invoiceRows,
    permissions: {
      canCreateProject: hasPermission(user, "projects:create"),
      canCreateDocument: hasPermission(user, "documents:create"),
      canViewFinance,
      canCreateInvoice: hasPermission(user, "finance:create"),
      canUpdateClient: hasPermission(user, "clients:update"),
      canDeleteClient: hasPermission(user, "clients:delete"),
    },
  };
}

export async function createClient(input: ClientInput) {
  const user = await requireUser();
  requirePermission(user, "clients:create");

  const data = clientSchema.parse(input);

  const [client] = await db
    .insert(clients)
    .values({
      ...data,
      createdBy: user.id,
    })
    .returning();

  await createAuditLog({
    userId: user.id,
    action: "create",
    entityType: "client",
    entityId: client.id,
    description: `Created client ${client.companyName}`,
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return {
    success: true,
    data: client,
  };
}

export async function updateClient(id: string, input: ClientInput) {
  const user = await requireUser();
  requirePermission(user, "clients:update");

  const clientId = idSchema.parse(id);
  const data = clientSchema.parse(input);

  const [client] = await db
    .update(clients)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(clients.id, clientId))
    .returning();

  if (!client) {
    throw new Error("Client not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "update",
    entityType: "client",
    entityId: client.id,
    description: `Updated client ${client.companyName}`,
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return {
    success: true,
    data: client,
  };
}

export async function deleteClient(id: string) {
  const user = await requireUser();
  requirePermission(user, "clients:delete");
  const clientId = idSchema.parse(id);

  const [client] = await db
    .delete(clients)
    .where(eq(clients.id, clientId))
    .returning();

  if (!client) {
    throw new Error("Client not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "delete",
    entityType: "client",
    entityId: clientId,
    description: `Deleted client ${client.companyName}`,
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return {
    success: true,
  };
}
