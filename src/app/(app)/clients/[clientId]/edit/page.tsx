import { ClientForm } from "@/components/clients/client-form";
import { getClientById } from "@/lib/actions/clients";

export default async function ClientEditPage({
  params,
}: {
  params: { clientId: string };
}) {
  const client = await getClientById(params.clientId);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Client</h1>
        <p className="mt-1 text-sm text-zinc-500">Update client details.</p>
      </div>

      <ClientForm
        client={{
          id: client.id,
          companyName: client.companyName,
          contactPerson: client.contactPerson ?? "",
          email: client.email ?? "",
          phone: client.phone ?? "",
          address: client.address ?? "",
          status: client.status,
          notes: client.notes ?? "",
        }}
      />
    </>
  );
}
