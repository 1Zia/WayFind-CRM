import { UserButton } from "@clerk/nextjs";

import type { users } from "@/db/schema";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { GlobalSearchInput } from "@/components/search/global-search-input";
import type { SearchTab } from "@/components/search/search-tabs";
import { hasPermission } from "@/lib/permissions";

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

type User = typeof users.$inferSelect;

export function AppHeader({
  latestNotifications,
  unreadNotifications,
  user,
}: {
  latestNotifications: NotificationPreview[];
  unreadNotifications: number;
  user: User;
}) {
  const searchTabs = getSearchTabsForUser(user);

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b bg-white px-6">
      <GlobalSearchInput tabs={searchTabs} />

      <div className="flex items-center gap-4">
        <NotificationDropdown
          notifications={latestNotifications}
          unreadCount={unreadNotifications}
        />

        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </header>
  );
}

function getSearchTabsForUser(user: User): SearchTab[] {
  const tabs: SearchTab[] = [{ value: "all", label: "All" }];

  if (hasPermission(user, "clients:view")) {
    tabs.push({ value: "clients", label: "Clients" });
  }

  if (hasPermission(user, "leads:view")) {
    tabs.push({ value: "leads", label: "Leads" });
  }

  if (hasPermission(user, "projects:view")) {
    tabs.push({ value: "projects", label: "Projects" });
  }

  if (
    hasPermission(user, "tasks:view") ||
    hasPermission(user, "tasks:view_assigned")
  ) {
    tabs.push({ value: "tasks", label: "Tasks" });
  }

  if (hasPermission(user, "finance:view")) {
    tabs.push({ value: "finance", label: "Finance" });
  }

  if (hasPermission(user, "documents:view")) {
    tabs.push({ value: "files", label: "Files" });
    tabs.push({ value: "docs", label: "Docs" });
  }

  if (user.role === "super_admin") {
    tabs.push({ value: "people", label: "People" });
  }

  return tabs;
}
