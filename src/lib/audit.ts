import { db } from "@/db";
import { auditLogs } from "@/db/schema";

type CreateAuditLogInput = {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
};

export async function createAuditLog(input: CreateAuditLogInput) {
  await db.insert(auditLogs).values({
    userId: input.userId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    description: input.description,
    metadata: input.metadata,
  });
}
