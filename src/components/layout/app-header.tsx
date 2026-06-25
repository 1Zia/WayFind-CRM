import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import Link from "next/link";

import { getUnreadNotificationsCount } from "@/lib/actions/notifications";

export async function AppHeader() {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  let unreadCount = 0;

  try {
    unreadCount = await getUnreadNotificationsCount();
  } catch {
    unreadCount = 0;
  }

  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b bg-white px-6">
      <Link
        href="/notifications"
        className="relative rounded-lg border p-2 text-zinc-600 hover:bg-zinc-50"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-purple-600 px-1.5 py-0.5 text-center text-xs font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </Link>

      {hasClerkKey ? <UserButton afterSignOutUrl="/sign-in" /> : null}
    </header>
  );
}
