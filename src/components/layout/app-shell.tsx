import type { users } from "@/db/schema";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

type User = typeof users.$inferSelect;

export function AppShell({
  children,
  unreadNotifications,
  user,
}: {
  children: React.ReactNode;
  unreadNotifications: number;
  user: User;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AppSidebar user={user} />

      <div className="flex min-h-screen flex-1 flex-col">
        <AppHeader unreadNotifications={unreadNotifications} />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
