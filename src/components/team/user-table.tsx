import Link from "next/link";

import {
  formatLastSeen,
  formatPresenceStatus,
  getPresenceStatus,
  type PresenceStatus,
} from "@/lib/presence";

type User = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "finance_manager" | "project_manager" | "employee";
  status: "active" | "inactive" | "suspended" | "disabled";
  lastSeenAt: Date | null;
  createdAt: Date;
};

type UserTableProps = {
  users: User[];
};

const roleLabels: Record<User["role"], string> = {
  super_admin: "Super Admin",
  finance_manager: "Finance Manager",
  project_manager: "Project Manager",
  employee: "Employee",
};

export function UserTable({ users }: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-zinc-50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Account Status</th>
            <th className="px-4 py-3 font-medium">Presence</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium">Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b last:border-0">
              <td className="px-4 py-3">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-zinc-500">{user.email}</div>
              </td>
              <td className="px-4 py-3">
                <RoleBadge role={user.role} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-4 py-3">
                <PresenceBadge
                  lastSeenAt={user.lastSeenAt}
                  status={getPresenceStatus(user.lastSeenAt)}
                />
              </td>
              <td className="px-4 py-3">{user.createdAt.toLocaleString()}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/team/users/${user.id}`}
                  className="text-purple-600 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                <div className="font-medium text-zinc-950">No users yet.</div>
                <div className="mt-1 text-sm">
                  Team members will appear here after they sign in or sync.
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function RoleBadge({ role }: { role: User["role"] }) {
  return (
    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
      {roleLabels[role]}
    </span>
  );
}

function StatusBadge({ status }: { status: User["status"] }) {
  const classes =
    status === "active"
      ? "bg-emerald-50 text-emerald-700"
      : status === "inactive" || status === "disabled"
        ? "bg-zinc-100 text-zinc-700"
        : "bg-red-50 text-red-700";

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}>
      {status === "inactive" ? "disabled" : status}
    </span>
  );
}

function PresenceBadge({
  lastSeenAt,
  status,
}: {
  lastSeenAt: Date | null;
  status: PresenceStatus;
}) {
  const classes =
    status === "online"
      ? "bg-emerald-50 text-emerald-700"
      : status === "away"
        ? "bg-amber-50 text-amber-700"
        : "bg-zinc-100 text-zinc-700";

  return (
    <div className="space-y-1">
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}
      >
        {formatPresenceStatus(status)}
      </span>
      <div className="text-xs text-zinc-500">{formatLastSeen(lastSeenAt)}</div>
    </div>
  );
}
