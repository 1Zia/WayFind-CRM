import Link from "next/link";

import { NotificationBadge } from "@/components/notifications/notification-badge";
import {
  getNotificationById,
  markNotificationAsRead,
} from "@/lib/actions/notifications";

export default async function NotificationPage({
  params,
}: {
  params: { notificationId: string };
}) {
  const notification = await getNotificationById(params.notificationId);

  if (!notification.isRead) {
    await markNotificationAsRead(notification.id);
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {notification.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Notification details</p>
        </div>

        <Link
          href="/notifications"
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <div className="flex flex-wrap items-center gap-2">
          <NotificationBadge type={notification.type} />
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
            {notification.isRead ? "Read" : "Unread"}
          </span>
        </div>

        <p className="mt-5 whitespace-pre-wrap text-sm text-zinc-700">
          {notification.message}
        </p>

        <p className="mt-6 text-xs text-zinc-500">
          Created {notification.createdAt.toLocaleString()}
        </p>
      </div>
    </>
  );
}
