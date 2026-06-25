import { AppShell } from "@/components/layout/app-shell";
import { getUnreadNotificationsCountForUser } from "@/lib/actions/notifications";
import { requireUser } from "@/lib/auth";

export default async function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const unreadNotifications = await getUnreadNotificationsCountForUser(user.id);

  return (
    <AppShell unreadNotifications={unreadNotifications} user={user}>
      {children}
    </AppShell>
  );
}
