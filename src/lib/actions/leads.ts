"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { clients, leads } from "@/db/schema";
import { createAuditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { hasPermission, requirePermission } from "@/lib/permissions";
import {
  leadSchema,
  leadStatusSchema,
  type LeadInput,
  type LeadStatus,
} from "@/lib/validations/lead";

const idSchema = z.string().uuid();
const DEFAULT_LIST_LIMIT = 50;

function nullable(value?: string) {
  return value || null;
}

function revalidateLeadPaths(id?: string) {
  revalidatePath("/leads");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  if (id) {
    revalidatePath(`/leads/${id}`);
    revalidatePath(`/leads/${id}/edit`);
  }
}

async function requireLeadPermission(
  permission: "leads:view" | "leads:create" | "leads:update" | "leads:delete",
) {
  const user = await requireUser();
  requirePermission(user, permission);
  return user;
}

export async function getLeads(filters?: { search?: string; status?: string }) {
  const user = await requireLeadPermission("leads:view");
  const search = filters?.search?.trim();
  const status = filters?.status;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(leads.leadName, `%${search}%`),
        ilike(leads.company, `%${search}%`),
        ilike(leads.email, `%${search}%`),
        ilike(leads.phone, `%${search}%`),
      ),
    );
  }

  if (status && status !== "all") {
    conditions.push(eq(leads.status, leadStatusSchema.parse(status)));
  }

  const where =
    conditions.length === 0
      ? undefined
      : conditions.length === 1
        ? conditions[0]
        : and(...conditions);

  const query = db.select().from(leads);

  if (!hasPermission(user, "leads:view")) {
    throw new Error("Forbidden");
  }

  if (where) {
    return query
      .where(where)
      .orderBy(desc(leads.createdAt))
      .limit(DEFAULT_LIST_LIMIT);
  }

  return query.orderBy(desc(leads.createdAt)).limit(DEFAULT_LIST_LIMIT);
}

export async function getLeadById(id: string) {
  await requireLeadPermission("leads:view");
  const leadId = idSchema.parse(id);

  const lead = await db.query.leads.findFirst({
    where: eq(leads.id, leadId),
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  return lead;
}

export async function createLead(input: LeadInput) {
  const user = await requireLeadPermission("leads:create");
  const data = leadSchema.parse(input);

  const [lead] = await db
    .insert(leads)
    .values({
      leadName: data.leadName,
      company: nullable(data.company),
      contact: nullable(data.contact),
      email: nullable(data.email),
      phone: nullable(data.phone),
      source: nullable(data.source),
      status: data.status,
      followUpDate: nullable(data.followUpDate),
      notes: nullable(data.notes),
      createdBy: user.id,
    })
    .returning();

  await createAuditLog({
    userId: user.id,
    action: "create",
    entityType: "lead",
    entityId: lead.id,
    description: `Created lead ${lead.leadName}`,
  });

  revalidateLeadPaths(lead.id);

  return {
    success: true,
    data: lead,
  };
}

export async function updateLead(id: string, input: LeadInput) {
  const user = await requireLeadPermission("leads:update");
  const leadId = idSchema.parse(id);
  const data = leadSchema.parse(input);

  const [lead] = await db
    .update(leads)
    .set({
      leadName: data.leadName,
      company: nullable(data.company),
      contact: nullable(data.contact),
      email: nullable(data.email),
      phone: nullable(data.phone),
      source: nullable(data.source),
      status: data.status,
      followUpDate: nullable(data.followUpDate),
      notes: nullable(data.notes),
      updatedAt: new Date(),
    })
    .where(eq(leads.id, leadId))
    .returning();

  if (!lead) {
    throw new Error("Lead not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "update",
    entityType: "lead",
    entityId: lead.id,
    description: `Updated lead ${lead.leadName}`,
  });

  revalidateLeadPaths(lead.id);

  return {
    success: true,
    data: lead,
  };
}

export async function deleteLead(id: string) {
  const user = await requireLeadPermission("leads:delete");
  const leadId = idSchema.parse(id);

  const [lead] = await db.delete(leads).where(eq(leads.id, leadId)).returning();

  if (!lead) {
    throw new Error("Lead not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "delete",
    entityType: "lead",
    entityId: lead.id,
    description: `Deleted lead ${lead.leadName}`,
  });

  revalidateLeadPaths(lead.id);

  return {
    success: true,
  };
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const user = await requireLeadPermission("leads:update");
  const leadId = idSchema.parse(id);
  const nextStatus = leadStatusSchema.parse(status);

  const [lead] = await db
    .update(leads)
    .set({
      status: nextStatus,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, leadId))
    .returning();

  if (!lead) {
    throw new Error("Lead not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "update_status",
    entityType: "lead",
    entityId: lead.id,
    description: `Updated lead status for ${lead.leadName} to ${nextStatus}`,
  });

  revalidateLeadPaths(lead.id);

  return {
    success: true,
    data: lead,
  };
}

export async function convertLeadToClient(id: string) {
  const user = await requireLeadPermission("leads:update");
  const leadId = idSchema.parse(id);
  const lead = await getLeadById(leadId);

  const [client] = await db
    .insert(clients)
    .values({
      companyName: lead.company || lead.leadName,
      contactPerson: lead.contact || lead.leadName,
      email: lead.email,
      phone: lead.phone,
      status: "prospect",
      notes: lead.notes,
      createdBy: user.id,
    })
    .returning();

  const [updatedLead] = await db
    .update(leads)
    .set({
      status: "converted",
      updatedAt: new Date(),
    })
    .where(eq(leads.id, leadId))
    .returning();

  await createAuditLog({
    userId: user.id,
    action: "convert",
    entityType: "lead",
    entityId: updatedLead.id,
    description: `Converted lead ${updatedLead.leadName} to client ${client.companyName}`,
  });

  revalidatePath("/clients");
  revalidateLeadPaths(updatedLead.id);

  return {
    success: true,
    data: {
      lead: updatedLead,
      client,
    },
  };
}
