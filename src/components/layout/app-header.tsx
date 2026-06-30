import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";

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
  onToggleSidebar,
}: {
  latestNotifications: NotificationPreview[];
  unreadNotifications: number;
  user: User;
  onToggleSidebar: () => void;
}) {
  const searchTabs = getSearchTabsForUser(user);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full border-b border-crm-border bg-crm-surface/95 backdrop-blur supports-[backdrop-filter]:bg-crm-surface/90">
      <div className="flex grow items-center justify-between gap-4 px-4 sm:px-6 md:px-8">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 lg:hidden shadow-theme-xs"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <GlobalSearchInput tabs={searchTabs} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4.5">
          <NotificationDropdown
            notifications={latestNotifications}
            unreadCount={unreadNotifications}
          />

          <div className="hidden h-6 w-px bg-gray-200 sm:block" />

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-crm-heading leading-tight">{user.name}</p>
              <p className="mt-0.5 text-xs font-medium text-gray-400 capitalize">
                {user.role.replace("_", " ")}
              </p>
            </div>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
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

  tabs.push({ value: "chat", label: "Chat" });

  return tabs;
}
