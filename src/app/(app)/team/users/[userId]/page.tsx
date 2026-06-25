import Link from "next/link";

import { UserDetails } from "@/components/team/user-details";
import { getUserById } from "@/lib/actions/users";
import { requireUser } from "@/lib/auth";

export default async function TeamUserPage({
  params,
}: {
  params: { userId: string };
}) {
  let user;
  let currentUser;

  try {
    [user, currentUser] = await Promise.all([
      getUserById(params.userId),
      requireUser(),
    ]);
  } catch {
    return <ForbiddenMessage />;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {user.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">User details</p>
        </div>

        <Link
          href="/team/users"
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <UserDetails currentUserId={currentUser.id} user={user} />
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
