"use client";

import type { users } from "@/db/schema";
import { SidebarNav } from "./sidebar-nav";

type User = typeof users.$inferSelect;

type AppSidebarProps = {
  user: User;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export function AppSidebar({ user, mobileOpen, onMobileClose }: AppSidebarProps) {
  return (
    <SidebarNav
      user={user}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    />
  );
}
