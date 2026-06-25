import Link from "next/link";

import { ForbiddenState } from "@/components/shared/forbidden-state";
import { getClients } from "@/lib/actions/clients";
import { requireUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export default async function ClientsPage() {
  let clients;
  let user;

  try {
    [clients, user] = await Promise.all([getClients(), requireUser()]);
  } catch {
    return <ForbiddenState />;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage company clients and customer records.
          </p>
        </div>

        {hasPermission(user, "clients:create") ? (
          <Link
            href="/clients/new"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            New Client
          </Link>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-zinc-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{client.companyName}</td>
                <td className="px-4 py-3">{client.contactPerson || "-"}</td>
                <td className="px-4 py-3">{client.email || "-"}</td>
                <td className="px-4 py-3 capitalize">{client.status}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/clients/${client.id}`}
                    className="text-purple-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {clients.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-zinc-500"
                >
                  <div className="font-medium text-zinc-950">
                    No clients yet.
                  </div>
                  <div className="mt-1 text-sm">
                    Client records will appear here after they are created.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
