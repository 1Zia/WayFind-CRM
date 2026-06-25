import Link from "next/link";

import { navigationItems } from "@/config/navigation";
import { requireUser } from "@/lib/auth";
import { canAccessRoute } from "@/lib/permissions";

export async function AppSidebar() {
  const user = await requireUser();
  const visibleItems = navigationItems.filter((item) =>
    canAccessRoute(user, item.href),
  );

  return (
    <aside className="hidden min-h-screen w-64 border-r bg-white px-4 py-6 lg:block">
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-tight text-zinc-950">
          WayFind
        </h1>
        <p className="text-sm text-zinc-500">CRM / ERP</p>
      </div>

      <nav className="space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
