import Link from "next/link";

import { ClientDeleteButton } from "@/components/clients/client-delete-button";
import { getClientById } from "@/lib/actions/clients";
import { requireUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export default async function ClientPage({
  params,
}: {
  params: { clientId: string };
}) {
  const [client, user] = await Promise.all([
    getClientById(params.clientId),
    requireUser(),
  ]);
  const canDeleteClient = hasPermission(user, "clients:delete");

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {client.companyName}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Client details</p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/clients/${client.id}/edit`}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Edit
          </Link>
          {canDeleteClient ? <ClientDeleteButton clientId={client.id} /> : null}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <div className="grid gap-4 text-sm md:grid-cols-2">
          <Detail label="Company" value={client.companyName} />
          <Detail label="Contact" value={client.contactPerson ?? "-"} />
          <Detail label="Email" value={client.email ?? "-"} />
          <Detail label="Phone" value={client.phone ?? "-"} />
          <Detail label="Address" value={client.address ?? "-"} />
          <Detail label="Status" value={client.status} />
        </div>

        <div className="mt-6">
          <p className="text-sm text-zinc-500">Notes</p>
          <div className="mt-1 text-sm">{client.notes ?? "-"}</div>
        </div>
      </div>
    </>
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
