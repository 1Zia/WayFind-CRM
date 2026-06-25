"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createInvoice, updateInvoice } from "@/lib/actions/finance";
import type { InvoiceInput } from "@/lib/validations/finance";

type Option = {
  id: string;
  name: string;
};

type InvoiceFormProps = {
  invoice?: InvoiceInput & { id: string };
  clients?: Option[];
  projects?: Option[];
};

export function InvoiceForm({
  invoice,
  clients = [],
  projects = [],
}: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<InvoiceInput>({
    clientId: invoice?.clientId ?? "",
    projectId: invoice?.projectId ?? "",
    invoiceNumber: invoice?.invoiceNumber ?? "",
    amount: invoice?.amount ?? 0,
    status: invoice?.status ?? "draft",
    issueDate: invoice?.issueDate ?? "",
    dueDate: invoice?.dueDate ?? "",
    paidAt: invoice?.paidAt ?? "",
    notes: invoice?.notes ?? "",
  });

  function updateField<K extends keyof InvoiceInput>(
    name: K,
    value: InvoiceInput[K],
  ) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);

      if (invoice?.id) {
        await updateInvoice(invoice.id, form);
        toast.success("Invoice updated");
      } else {
        await createInvoice(form);
        toast.success("Invoice created");
      }

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
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Client</label>
          <select
            value={form.clientId ?? ""}
            onChange={(event) => updateField("clientId", event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">No client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Project</label>
          <select
            value={form.projectId ?? ""}
            onChange={(event) => updateField("projectId", event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Invoice Number</label>
          <input
            value={form.invoiceNumber}
            onChange={(event) =>
              updateField("invoiceNumber", event.target.value)
            }
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Amount</label>
          <input
            type="number"
            value={form.amount}
            onChange={(event) => updateField("amount", Number(event.target.value))}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            value={form.status}
            onChange={(event) =>
              updateField("status", event.target.value as InvoiceInput["status"])
            }
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Issue Date</label>
          <input
            type="date"
            value={form.issueDate}
            onChange={(event) => updateField("issueDate", event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Due Date</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(event) => updateField("dueDate", event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Paid At</label>
          <input
            type="date"
            value={form.paidAt ?? ""}
            onChange={(event) => updateField("paidAt", event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Notes</label>
        <textarea
          value={form.notes ?? ""}
          onChange={(event) => updateField("notes", event.target.value)}
          className="mt-1 min-h-24 w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      <button
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Saving..." : invoice ? "Update Invoice" : "Create Invoice"}
      </button>
    </form>
  );
}
