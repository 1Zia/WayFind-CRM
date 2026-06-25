"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { markAllNotificationsAsRead } from "@/lib/actions/notifications";
import { NotificationCard } from "@/components/notifications/notification-card";

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

type NotificationListProps = {
  notifications: Notification[];
  unreadCount: number;
};

export function NotificationList({
  notifications,
  unreadCount,
}: NotificationListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMarkAllRead() {
    try {
      setLoading(true);
      await markAllNotificationsAsRead();
      toast.success("All notifications marked as read");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">
          {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
        </p>

        {unreadCount > 0 ? (
          <button
            type="button"
            disabled={loading}
            onClick={handleMarkAllRead}
            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Mark all as read"}
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        {notifications.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-zinc-500">
            <div className="font-medium text-zinc-950">
              No notifications yet.
            </div>
            <div className="mt-1">
              System alerts and activity updates will appear here.
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
