import { UserTable } from "@/components/team/user-table";
import { getUsers } from "@/lib/actions/users";

export default async function TeamUsersPage() {
  let users;

  try {
    users = await getUsers();
  } catch {
    return <ForbiddenMessage />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Team Users</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage team members, roles, and account status.
        </p>
      </div>

      <div className="mb-4 rounded-xl border bg-white p-4">
        <p className="text-sm text-zinc-500">Total Users</p>
        <p className="mt-1 text-2xl font-semibold">{users.length}</p>
      </div>

      <UserTable users={users} />
    </>
  );
}

function ForbiddenMessage() {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Team access required
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Only super admins can manage users.
      </p>
    </div>
  );
}
