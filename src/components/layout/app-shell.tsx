import type { users } from "@/db/schema";

import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

type User = typeof users.$inferSelect;
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

export function AppShell({
  children,
  latestNotifications,
  unreadNotifications,
  user,
}: {
  children: React.ReactNode;
  latestNotifications: NotificationPreview[];
  unreadNotifications: number;
  user: User;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <PresenceHeartbeat />
      <AppSidebar user={user} />

      <div className="flex min-h-screen flex-1 flex-col">
        <AppHeader
          latestNotifications={latestNotifications}
          unreadNotifications={unreadNotifications}
          user={user}
        />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
