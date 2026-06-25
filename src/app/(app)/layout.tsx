import { AppShell } from "@/components/layout/app-shell";
import {
  getLatestNotificationsForUser,
  getUnreadNotificationsCountForUser,
} from "@/lib/actions/notifications";
import { requireUser } from "@/lib/auth";

export default async function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const [latestNotifications, unreadNotifications] = await Promise.all([
    getLatestNotificationsForUser(user.id, 5),
    getUnreadNotificationsCountForUser(user.id),
  ]);

  return (
    <AppShell
      latestNotifications={latestNotifications}
      unreadNotifications={unreadNotifications}
      user={user}
    >
      {children}
    </AppShell>
  );
}
