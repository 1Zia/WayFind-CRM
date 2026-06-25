import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import Link from "next/link";

export function AppHeader({
  unreadNotifications,
}: {
  unreadNotifications: number;
}) {
  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b bg-white px-6">
      <Link
        href="/notifications"
        className="relative rounded-lg border p-2 text-zinc-600 hover:bg-zinc-50"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadNotifications > 0 ? (
          <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-purple-600 px-1.5 py-0.5 text-center text-xs font-medium text-white">
            {unreadNotifications > 99 ? "99+" : unreadNotifications}
          </span>
        ) : null}
      </Link>

      <UserButton afterSignOutUrl="/sign-in" />
    </header>
  );
}
