import { NotificationList } from "@/components/notifications/notification-list";
import {
  getNotifications,
  getUnreadNotificationsCount,
} from "@/lib/actions/notifications";

export default async function NotificationsPage() {
  const [notifications, unreadCount] = await Promise.all([
    getNotifications(),
    getUnreadNotificationsCount(),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          View system alerts and activity updates.
        </p>
      </div>

      <NotificationList
        notifications={notifications}
        unreadCount={unreadCount}
      />
    </>
  );
}
