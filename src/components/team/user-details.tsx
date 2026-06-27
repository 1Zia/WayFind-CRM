import { UserRoleSelect } from "@/components/team/user-role-select";
import { UserStatusSelect } from "@/components/team/user-status-select";
import {
  formatLastSeen,
  formatPresenceStatus,
  getPresenceStatus,
} from "@/lib/presence";

type User = {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: "super_admin" | "finance_manager" | "project_manager" | "employee";
  status: "active" | "inactive" | "suspended" | "disabled";
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type UserDetailsProps = {
  user: User;
  currentUserId: string;
};

export function UserDetails({ user, currentUserId }: UserDetailsProps) {
  const isCurrentUser = user.id === currentUserId;
  const presenceStatus = getPresenceStatus(user.lastSeenAt);

  return (
    <div className="space-y-6 rounded-xl border bg-white p-6">
      <div className="flex items-center gap-4">
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold text-zinc-600">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <p className="text-sm text-zinc-500">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-4 text-sm md:grid-cols-2">
        <Detail label="Role" value={user.role.replace("_", " ")} />
        <Detail label="Account Status" value={formatAccountStatus(user.status)} />
        <Detail
          label="Presence Status"
          value={formatPresenceStatus(presenceStatus)}
        />
        <Detail label="Last Seen" value={formatLastSeen(user.lastSeenAt)} />
        <Detail label="Clerk ID" value={user.clerkId} />
        <Detail label="Created" value={user.createdAt.toLocaleString()} />
        <Detail label="Updated" value={user.updatedAt.toLocaleString()} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium">Change Role</p>
          <UserRoleSelect
            isCurrentUser={isCurrentUser}
            userId={user.id}
            value={user.role}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Change Account Status</p>
          <UserStatusSelect
            isCurrentUser={isCurrentUser}
            userId={user.id}
            value={user.status}
          />
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-zinc-500">{label}</p>
      <div className="mt-1 font-medium text-zinc-950">{value}</div>
    </div>
  );
}

function formatAccountStatus(status: User["status"]) {
  const normalizedStatus = status === "inactive" ? "disabled" : status;
  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
}
