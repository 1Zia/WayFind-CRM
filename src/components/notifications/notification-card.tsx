"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  deleteNotification,
  markNotificationAsRead,
} from "@/lib/actions/notifications";
import { NotificationBadge } from "@/components/notifications/notification-badge";

type Notification = {
  id: string;
  title: string;
  message: string;
  type:
    | "task_assigned"
    | "project_deadline"
    | "payment_received"
    | "approval_required"
    | "system";
  isRead: boolean;
  createdAt: Date;
};

type NotificationCardProps = {
  notification: Notification;
};

export function NotificationCard({ notification }: NotificationCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"read" | "delete" | null>(null);

  async function handleMarkRead() {
    try {
      setLoading("read");
      await markNotificationAsRead(notification.id);
      toast.success("Notification marked as read");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this notification?");

    if (!confirmed) {
      return;
    }

    try {
      setLoading("delete");
      await deleteNotification(notification.id);
      toast.success("Notification deleted");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 px-4 py-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-950">
            {notification.title}
          </h2>
          <NotificationBadge type={notification.type} />
          {!notification.isRead ? (
            <span className="liquid-glass-active rounded-full px-2 py-0.5 text-xs font-semibold text-slate-900">
              Unread
            </span>
          ) : (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
              Read
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
          {notification.message}
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          {notification.createdAt.toLocaleString()}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap justify-end gap-3 text-sm">
        <Link
          href={`/notifications/${notification.id}`}
          className="text-purple-600 hover:underline"
        >
          View
        </Link>
        {!notification.isRead ? (
          <button
            type="button"
            disabled={loading === "read"}
            onClick={handleMarkRead}
            className="text-purple-600 hover:underline disabled:opacity-60"
          >
            {loading === "read" ? "Saving..." : "Mark read"}
          </button>
        ) : null}
        <button
          type="button"
          disabled={loading === "delete"}
          onClick={handleDelete}
          className="text-red-600 hover:underline disabled:opacity-60"
        >
          {loading === "delete" ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
