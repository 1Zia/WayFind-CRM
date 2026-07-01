import { UserButton } from "@clerk/nextjs";
import { Mail, Menu } from "lucide-react";
import Link from "next/link";

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
    <header className="sticky top-0 z-40 flex h-[88px] w-full border-b border-white/70 bg-white/85 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.55)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/75">
      <div className="flex grow items-center justify-between gap-5 px-4 sm:px-7 md:px-10">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/85 text-gray-500 shadow-theme-xs transition hover:-translate-y-0.5 hover:bg-white hover:text-gray-900 hover:shadow-theme-md lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <GlobalSearchInput tabs={searchTabs} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          <NotificationDropdown
            notifications={latestNotifications}
            unreadCount={unreadNotifications}
          />

          <Link
            href="/chat"
            aria-label="Open chat"
            className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/80 bg-white/85 text-crm-heading shadow-theme-xs transition hover:-translate-y-0.5 hover:bg-white hover:shadow-theme-md sm:flex"
          >
            <Mail className="h-4.5 w-4.5" />
          </Link>

          <div className="hidden h-8 w-px bg-gray-200 sm:block" />

          <div className="flex items-center gap-3 rounded-2xl border border-transparent px-1.5 py-1 transition hover:border-white/80 hover:bg-white/55">
            <div className="hidden text-right sm:block">
              <p className="max-w-[170px] truncate text-sm font-bold leading-tight text-crm-heading">
                {user.name}
              </p>
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
