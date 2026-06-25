"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, ilike, or, desc } from "drizzle-orm";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";
import { clientSchema, type ClientInput } from "@/lib/validations/client";

const idSchema = z.string().uuid();

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
      .orderBy(desc(clients.createdAt));
  }

  return db.select().from(clients).orderBy(desc(clients.createdAt));
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

  return {
    success: true,
  };
}
