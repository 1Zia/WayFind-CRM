import type { users } from "@/db/schema";

type User = typeof users.$inferSelect;

const permissions = {
  super_admin: ["*"],

  finance_manager: [
    "dashboard:view",
    "finance:view",
    "finance:create",
    "finance:update",
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
    "documents:view",
    "documents:upload",
    "documents:create",
    "documents:update",
    "documents:delete",
    "team:view",
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
