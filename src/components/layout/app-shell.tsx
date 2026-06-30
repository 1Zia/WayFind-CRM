"use client";

import { useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-crm-body">
      <PresenceHeartbeat />
      <AppSidebar
        user={user}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <AppHeader
          latestNotifications={latestNotifications}
          unreadNotifications={unreadNotifications}
          user={user}
          onToggleSidebar={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
