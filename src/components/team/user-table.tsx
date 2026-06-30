import Link from "next/link";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmptyRow,
  DataTableHead,
  DataTableHeadCell,
  DataTableRow,
  DataTableWrapper,
} from "@/components/shared/data-table-wrapper";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
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
    <DataTableWrapper>
      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableHeadCell>User</DataTableHeadCell>
            <DataTableHeadCell>Role</DataTableHeadCell>
            <DataTableHeadCell>Account Status</DataTableHeadCell>
            <DataTableHeadCell>Presence</DataTableHeadCell>
            <DataTableHeadCell>Created</DataTableHeadCell>
            <DataTableHeadCell>Action</DataTableHeadCell>
          </tr>
        </DataTableHead>

        <DataTableBody>
          {users.map((user) => (
            <DataTableRow key={user.id}>
              <DataTableCell>
                <div className="font-medium text-crm-heading">{user.name}</div>
                <div className="text-xs text-crm-muted">{user.email}</div>
              </DataTableCell>
              <DataTableCell>
                <StatusBadge tone="secondary">
                  {roleLabels[user.role]}
                </StatusBadge>
              </DataTableCell>
              <DataTableCell>
                <AccountStatusBadge status={user.status} />
              </DataTableCell>
              <DataTableCell>
                <PresenceBadge
                  lastSeenAt={user.lastSeenAt}
                  status={getPresenceStatus(user.lastSeenAt)}
                />
              </DataTableCell>
              <DataTableCell>{user.createdAt.toLocaleString()}</DataTableCell>
              <DataTableCell>
                <Link
                  href={`/team/users/${user.id}`}
                  className="crm-action-link"
                >
                  View
                </Link>
              </DataTableCell>
            </DataTableRow>
          ))}

          {users.length === 0 ? (
            <DataTableEmptyRow colSpan={6}>
              <EmptyState
                compact
                title="No users yet"
                description="Team members will appear here after they sign in or sync."
              />
            </DataTableEmptyRow>
          ) : null}
        </DataTableBody>
      </DataTable>
    </DataTableWrapper>
  );
}

function AccountStatusBadge({ status }: { status: User["status"] }) {
  const tone =
    status === "active"
      ? "success"
      : status === "suspended"
        ? "danger"
        : "default";

  return (
    <StatusBadge tone={tone}>
      {status === "inactive" ? "disabled" : status}
    </StatusBadge>
  );
}

function PresenceBadge({
  lastSeenAt,
  status,
}: {
  lastSeenAt: Date | null;
  status: PresenceStatus;
}) {
  const tone =
    status === "online" ? "success" : status === "away" ? "warning" : "default";

  return (
    <div className="space-y-1">
      <StatusBadge tone={tone}>{formatPresenceStatus(status)}</StatusBadge>
      <div className="text-xs text-crm-muted">{formatLastSeen(lastSeenAt)}</div>
    </div>
  );
}
