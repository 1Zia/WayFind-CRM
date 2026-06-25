"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { ClientInput } from "@/lib/validations/client";
import { createClient, updateClient } from "@/lib/actions/clients";

type ClientFormProps = {
  client?: ClientInput & {
    id: string;
  };
};

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<ClientInput>({
    companyName: client?.companyName ?? "",
    contactPerson: client?.contactPerson ?? "",
    email: client?.email ?? "",
    phone: client?.phone ?? "",
    address: client?.address ?? "",
    status: client?.status ?? "prospect",
    notes: client?.notes ?? "",
  });

  const [loading, setLoading] = useState(false);

  function updateField(name: keyof ClientInput, value: string) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);

      if (client?.id) {
        await updateClient(client.id, form);
        toast.success("Client updated");
      } else {
        await createClient(form);
        toast.success("Client created");
      }

      router.push("/clients");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-5 rounded-xl border bg-white p-6"
    >
      <div>
        <label className="text-sm font-medium">Company Name</label>
        <input
          value={form.companyName}
          onChange={(e) => updateField("companyName", e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Acme Corporation"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Contact Person</label>
        <input
          value={form.contactPerson}
          onChange={(e) => updateField("contactPerson", e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Ahmed Khan"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Email</label>
        <input
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="client@example.com"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Phone</label>
        <input
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="+92..."
        />
      </div>

      <div>
        <label className="text-sm font-medium">Status</label>
        <select
          value={form.status}
          onChange={(e) => updateField("status", e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="prospect">Prospect</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          className="mt-1 min-h-28 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Client notes..."
        />
      </div>

      <button
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Saving..." : client ? "Update Client" : "Create Client"}
      </button>
    </form>
  );
}
