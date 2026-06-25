import { ClientForm } from "@/components/clients/client-form";

export default function NewClientPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">New Client</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Add a new company or customer to your CRM.
        </p>
      </div>

      <ClientForm />
    </>
  );
}


