import type { users } from "@/db/schema";

type User = typeof users.$inferSelect;

const permissions = {
  super_admin: ["*"],

  finance_manager: [
    "dashboard:view",
    "finance:view",
    "finance:create",
    "finance:update",
    "finance:delete",
    "documents:view",
    "reports:view",
  ],

  project_manager: [
    "dashboard:view",
    "clients:view",
    "clients:create",
    "clients:update",
    "leads:view",
    "leads:create",
    "leads:update",
    "projects:view",
    "projects:create",
    "projects:update",
    "tasks:view",
    "tasks:create",
    "tasks:update",
    "tasks:assign",
    "reports:view",
    "documents:view",
    "documents:upload",
    "documents:create",
    "documents:update",
    "documents:delete",
  ],

  employee: [
    "dashboard:view",
    "projects:view_assigned",
    "tasks:view_assigned",
    "tasks:update_assigned",
    "documents:view",
    "documents:upload",
    "documents:create",
  ],
} as const;

export type Permission =
  | "*"
  | "dashboard:view"
  | "clients:view"
  | "clients:create"
  | "clients:update"
  | "clients:delete"
  | "leads:view"
  | "leads:create"
  | "leads:update"
  | "leads:delete"
  | "projects:view"
  | "projects:view_assigned"
  | "projects:create"
  | "projects:update"
  | "projects:delete"
  | "tasks:view"
  | "tasks:view_assigned"
  | "tasks:create"
  | "tasks:update"
  | "tasks:update_assigned"
  | "tasks:assign"
  | "finance:view"
  | "finance:create"
  | "finance:update"
  | "finance:delete"
  | "reports:view"
  | "team:view"
  | "documents:view"
  | "documents:upload"
  | "documents:create"
  | "documents:update"
  | "documents:delete";

export function hasPermission(user: User, permission: Permission) {
  const rolePermissions = permissions[user.role] as readonly Permission[];

  return rolePermissions.includes("*") || rolePermissions.includes(permission);
}

export function requirePermission(user: User, permission: Permission) {
  if (!hasPermission(user, permission)) {
    throw new Error("Forbidden");
  }
}

export function canAccessRoute(user: User, href: string) {
  if (href.startsWith("/dashboard")) {
    return hasPermission(user, "dashboard:view");
  }

  if (href.startsWith("/clients")) {
    return hasPermission(user, "clients:view");
  }

  if (href.startsWith("/leads")) {
    return hasPermission(user, "leads:view");
  }

  if (href.startsWith("/projects")) {
    return hasPermission(user, "projects:view");
  }

  if (href.startsWith("/tasks")) {
    return (
      hasPermission(user, "tasks:view") ||
      hasPermission(user, "tasks:view_assigned")
    );
  }

  if (href.startsWith("/finance")) {
    return hasPermission(user, "finance:view");
  }

  if (href.startsWith("/documents")) {
    return hasPermission(user, "documents:view");
  }

  if (href.startsWith("/reports")) {
    return hasPermission(user, "reports:view");
  }

  if (href.startsWith("/audit-logs")) {
    return user.role === "super_admin";
  }

  if (href.startsWith("/team")) {
    return user.role === "super_admin";
  }

  if (
    href.startsWith("/notifications") ||
    href.startsWith("/settings") ||
    href.startsWith("/chat")
  ) {
    return true;
  }

  return false;
}
