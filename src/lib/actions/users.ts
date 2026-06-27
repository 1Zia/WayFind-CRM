"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, count, desc, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createAuditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";

const userIdSchema = z.string().uuid();
const userRoleSchema = z.enum([
  "super_admin",
  "finance_manager",
  "project_manager",
  "employee",
]);
const userStatusSchema = z.enum(["active", "suspended", "disabled"]);

async function requireSuperAdmin() {
  const user = await requireUser();

  if (user.role !== "super_admin") {
    throw new Error("Forbidden");
  }

  return user;
}

async function isOnlySuperAdmin(userId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(users)
    .where(andSuperAdminExcept(userId));

  return result.count === 0;
}

function andSuperAdminExcept(userId: string) {
  return and(eq(users.role, "super_admin"), ne(users.id, userId));
}

function revalidateUserPaths(userId: string) {
  revalidatePath("/team/users");
  revalidatePath(`/team/users/${userId}`);
}

export async function getUsers() {
  await requireSuperAdmin();

  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUserById(userId: string) {
  await requireSuperAdmin();
  const targetUserId = userIdSchema.parse(userId);

  const user = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function updateUserRole(userId: string, role: string) {
  const actor = await requireSuperAdmin();
  const targetUserId = userIdSchema.parse(userId);
  const nextRole = userRoleSchema.parse(role);

  const existingUser = await getUserById(targetUserId);

  if (
    existingUser.role === "super_admin" &&
    nextRole !== "super_admin" &&
    (await isOnlySuperAdmin(targetUserId))
  ) {
    throw new Error("Cannot remove the only super admin.");
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      role: nextRole,
      updatedAt: new Date(),
    })
    .where(eq(users.id, targetUserId))
    .returning();

  if (!updatedUser) {
    throw new Error("User not found");
  }

  await createAuditLog({
    userId: actor.id,
    action: "update_role",
    entityType: "user",
    entityId: updatedUser.id,
    description: `Updated user role for ${updatedUser.email} to ${nextRole}`,
  });

  revalidateUserPaths(updatedUser.id);

  return {
    success: true,
    data: updatedUser,
  };
}

export async function updateUserStatus(userId: string, status: string) {
  const actor = await requireSuperAdmin();
  const targetUserId = userIdSchema.parse(userId);
  const nextStatus = userStatusSchema.parse(status);

  const existingUser = await getUserById(targetUserId);

  if (
    existingUser.role === "super_admin" &&
    nextStatus !== "active" &&
    (await isOnlySuperAdmin(targetUserId))
  ) {
    throw new Error("Cannot disable or suspend the only super admin.");
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      status: nextStatus,
      updatedAt: new Date(),
    })
    .where(eq(users.id, targetUserId))
    .returning();

  if (!updatedUser) {
    throw new Error("User not found");
  }

  await createAuditLog({
    userId: actor.id,
    action: "update_account_status",
    entityType: "user",
    entityId: updatedUser.id,
    description: `Updated account status for ${updatedUser.email} to ${nextStatus}`,
  });

  revalidateUserPaths(updatedUser.id);

  return {
    success: true,
    data: updatedUser,
  };
}
