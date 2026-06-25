import { UserButton } from "@clerk/nextjs";

import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

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

export function AppHeader({
  latestNotifications,
  unreadNotifications,
}: {
  latestNotifications: NotificationPreview[];
  unreadNotifications: number;
}) {
  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b bg-white px-6">
      <NotificationDropdown
        notifications={latestNotifications}
        unreadCount={unreadNotifications}
      />

      <UserButton afterSignOutUrl="/sign-in" />
    </header>
  );
}
