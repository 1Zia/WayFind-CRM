"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { FormCard } from "@/components/shared/form-card";
import type { ClientInput } from "@/lib/validations/client";
import { createClient, updateClient } from "@/lib/actions/clients";
import { LiquidButton } from "@/components/ui/button";

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
    <FormCard
      title={client ? "Edit Client" : "New Client"}
      description="Keep client contact details accurate for projects and billing."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="crm-label">Company Name</label>
          <input
            value={form.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            className="crm-input"
            placeholder="Acme Corporation"
          />
        </div>

        <div>
          <label className="crm-label">Contact Person</label>
          <input
            value={form.contactPerson}
            onChange={(e) => updateField("contactPerson", e.target.value)}
            className="crm-input"
            placeholder="Ahmed Khan"
          />
        </div>

        <div>
          <label className="crm-label">Email</label>
          <input
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="crm-input"
            placeholder="client@example.com"
          />
        </div>

        <div>
          <label className="crm-label">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className="crm-input"
            placeholder="+92..."
          />
        </div>

        <div>
          <label className="crm-label">Address</label>
          <input
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            className="crm-input"
            placeholder="Business address"
          />
        </div>

        <div>
          <label className="crm-label">Status</label>
          <select
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="crm-input"
          >
            <option value="prospect">Prospect</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="crm-label">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            className="crm-input min-h-28"
            placeholder="Client notes..."
          />
        </div>

        <LiquidButton type="submit" disabled={loading}>
          {loading ? "Saving..." : client ? "Update Client" : "Create Client"}
        </LiquidButton>
      </form>
    </FormCard>
  );
}
