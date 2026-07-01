"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, X } from "lucide-react";

import { navigationGroups } from "@/config/navigation";
import { canAccessRoute } from "@/lib/permissions";
import type { users } from "@/db/schema";

type User = typeof users.$inferSelect;

type SidebarNavProps = {
  user: User;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({
  user,
  mobileOpen = false,
  onMobileClose,
}: SidebarNavProps) {
  const pathname = usePathname();

  const content = (
    <>
      <div className="flex h-[72px] items-center justify-between border-b border-crm-border px-6">
        <Link
          href="/dashboard"
          onClick={onMobileClose}
          className="flex items-center gap-3.5"
        >
          <div className="liquid-glass-active flex h-10 w-10 items-center justify-center rounded-xl text-slate-900">
            <Zap className="relative z-10 h-5 w-5 fill-slate-900" />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-crm-heading leading-tight">
              WayFind
            </p>
            <p className="text-xs font-medium text-gray-400">CRM / ERP Workspace</p>
          </div>
        </Link>

        {onMobileClose ? (
          <button
            type="button"
            aria-label="Close menu"
            onClick={onMobileClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-4.5 py-6 no-scrollbar">
        {navigationGroups.map((group) => {
          const visibleItems = group.items.filter((item) =>
            canAccessRoute(user, item.href),
          );

          if (visibleItems.length === 0) {
            return null;
          }

          return (
            <div key={group.label} className="mb-6 last:mb-0">
              <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {group.label}
              </p>
              <ul className="space-y-1.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveRoute(pathname, item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onMobileClose}
                        className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "liquid-glass-active text-slate-900"
                            : "text-gray-700 hover:bg-white hover:text-slate-900"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 shrink-0 ${
                            active ? "text-slate-900" : "text-gray-500"
                          }`}
                        />
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-crm-border px-6 py-4.5">
        <p className="truncate text-sm font-semibold text-crm-heading">
          {user.name}
        </p>
        <p className="truncate text-xs font-medium text-gray-400 capitalize">
          {user.role.replace("_", " ")}
        </p>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden w-[290px] shrink-0 flex-col border-r border-crm-border bg-[#f7f8fa] lg:flex h-screen sticky top-0">
        {content}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={onMobileClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          />
          <aside className="relative flex h-full w-[290px] max-w-[85vw] flex-col bg-[#f7f8fa] shadow-theme-xl">
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
}
