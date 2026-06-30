import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { UserTable } from "@/components/team/user-table";
import { getUsers } from "@/lib/actions/users";
import { Users } from "lucide-react";

export default async function TeamUsersPage() {
  let users;

  try {
    users = await getUsers();
  } catch {
    return <ForbiddenMessage />;
  }

  return (
    <>
      <PageHeader
        title="Team Users"
        description="Manage team members, roles, and account status."
      />

      <div className="mb-4 max-w-xs">
        <MetricCard title="Total Users" value={users.length} icon={Users} tone="secondary" />
      </div>

      <UserTable users={users} />
    </>
  );
}

function ForbiddenMessage() {
  return (
    <div className="crm-card p-6">
      <h1 className="text-2xl font-semibold tracking-tight text-crm-heading">
        Team access required
      </h1>
      <p className="mt-2 text-sm text-crm-muted">
        Only super admins can manage users.
      </p>
    </div>
  );
}
