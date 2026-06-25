"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, count, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { createAuditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";

const idSchema = z.string().uuid();

const notificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum([
    "task_assigned",
    "project_deadline",
    "payment_received",
    "approval_required",
    "system",
  ]),
});

export type NotificationInput = z.infer<typeof notificationSchema>;

function revalidateNotificationPaths(id?: string) {
  revalidatePath("/notifications");

  if (id) {
    revalidatePath(`/notifications/${id}`);
  }
}

export async function getNotifications() {
  const user = await requireUser();

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotificationsCount() {
  const user = await requireUser();

  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)));

  return result.count;
}

export async function getNotificationById(id: string) {
  const user = await requireUser();
  const notificationId = idSchema.parse(id);

  const notification = await db.query.notifications.findFirst({
    where:
      user.role === "super_admin"
        ? eq(notifications.id, notificationId)
        : and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, user.id),
          ),
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  return notification;
}

export async function createNotification(input: NotificationInput) {
  const user = await requireUser();
  const data = notificationSchema.parse(input);

  if (user.role !== "super_admin" && data.userId !== user.id) {
    throw new Error("Forbidden");
  }

  const [notification] = await db
    .insert(notifications)
    .values(data)
    .returning();

  await createAuditLog({
    userId: user.id,
    action: "create",
    entityType: "notification",
    entityId: notification.id,
    description: `Created notification ${notification.title}`,
  });

  revalidateNotificationPaths(notification.id);

  return {
    success: true,
    data: notification,
  };
}

export async function createSystemNotification(input: NotificationInput) {
  const data = notificationSchema.parse(input);

  const [notification] = await db
    .insert(notifications)
    .values({
      ...data,
      isRead: false,
    })
    .returning();

  await createAuditLog({
    action: "create",
    entityType: "notification",
    entityId: notification.id,
    description: `Created system notification ${notification.title}`,
  });

  revalidateNotificationPaths(notification.id);

  return {
    success: true,
    data: notification,
  };
}

export async function markNotificationAsRead(id: string) {
  const user = await requireUser();
  const notificationId = idSchema.parse(id);

  const [notification] = await db
    .update(notifications)
    .set({
      isRead: true,
    })
    .where(
      user.role === "super_admin"
        ? eq(notifications.id, notificationId)
        : and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, user.id),
          ),
    )
    .returning();

  if (!notification) {
    throw new Error("Notification not found");
  }

  revalidateNotificationPaths(notification.id);

  return {
    success: true,
    data: notification,
  };
}

export async function markAllNotificationsAsRead() {
  const user = await requireUser();

  await db
    .update(notifications)
    .set({
      isRead: true,
    })
    .where(
      user.role === "super_admin"
        ? eq(notifications.isRead, false)
        : eq(notifications.userId, user.id),
    );

  revalidateNotificationPaths();

  return {
    success: true,
  };
}

export async function deleteNotification(id: string) {
  const user = await requireUser();
  const notificationId = idSchema.parse(id);

  const [notification] = await db
    .delete(notifications)
    .where(
      user.role === "super_admin"
        ? eq(notifications.id, notificationId)
        : and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, user.id),
          ),
    )
    .returning();

  if (!notification) {
    throw new Error("Notification not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "delete",
    entityType: "notification",
    entityId: notification.id,
    description: `Deleted notification ${notification.title}`,
  });

  revalidateNotificationPaths(notification.id);

  return {
    success: true,
  };
}
