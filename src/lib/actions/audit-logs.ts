"use server";

import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";

const idSchema = z.string().uuid();

async function requireSuperAdmin() {
  const user = await requireUser();

  if (user.role !== "super_admin") {
    throw new Error("Forbidden");
  }

  return user;
}

const auditLogSelect = {
  id: auditLogs.id,
  userId: auditLogs.userId,
  userName: users.name,
  userEmail: users.email,
  action: auditLogs.action,
  entityType: auditLogs.entityType,
  entityId: auditLogs.entityId,
  description: auditLogs.description,
  metadata: auditLogs.metadata,
  createdAt: auditLogs.createdAt,
};

export async function getAuditLogs() {
  await requireSuperAdmin();

  return db
    .select(auditLogSelect)
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);
}

export async function getAuditLogById(id: string) {
  await requireSuperAdmin();
  const auditLogId = idSchema.parse(id);

  const [log] = await db
    .select(auditLogSelect)
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .where(eq(auditLogs.id, auditLogId))
    .limit(1);

  if (!log) {
    throw new Error("Audit log not found");
  }

  return log;
}
