"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { NotificationBadge } from "@/components/notifications/notification-badge";
import { markAllNotificationsAsRead } from "@/lib/actions/notifications";

type NotificationPreview = {
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

type NotificationDropdownProps = {
  notifications: NotificationPreview[];
  unreadCount: number;
};

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function NotificationDropdown({
  notifications,
  unreadCount,
}: NotificationDropdownProps) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleMarkAllRead() {
    try {
      setLoading(true);
      await markAllNotificationsAsRead();
      toast.success("All notifications marked as read");
      setOpen(false);
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
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Open notifications"
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-lg border p-2 text-zinc-600 hover:bg-zinc-50"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-purple-600 px-1.5 py-0.5 text-center text-xs font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-3 w-[360px] overflow-hidden rounded-xl border bg-white shadow-lg">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950">
                Notifications
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                {unreadCount} unread notification
                {unreadCount === 1 ? "" : "s"}
              </p>
            </div>

            {unreadCount > 0 ? (
              <button
                type="button"
                disabled={loading}
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-purple-600 hover:underline disabled:opacity-60"
              >
                {loading ? "Saving..." : "Mark all as read"}
              </button>
            ) : null}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={`/notifications/${notification.id}`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 hover:bg-zinc-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-medium text-zinc-950">
                            {notification.title}
                          </p>
                          {!notification.isRead ? (
                            <span className="h-2 w-2 rounded-full bg-purple-600" />
                          ) : null}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-600">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-zinc-500">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <NotificationBadge type={notification.type} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-zinc-500">
                No notifications yet.
              </div>
            )}
          </div>

          <div className="border-t px-4 py-3">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-medium text-purple-600 hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
