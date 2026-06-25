"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createIncome, updateIncome } from "@/lib/actions/finance";
import type { IncomeInput } from "@/lib/validations/finance";

type Option = {
  id: string;
  name: string;
};

type IncomeFormProps = {
  income?: IncomeInput & { id: string };
  clients?: Option[];
  projects?: Option[];
};

export function IncomeForm({
  income,
  clients = [],
  projects = [],
}: IncomeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<IncomeInput>({
    clientId: income?.clientId ?? "",
    projectId: income?.projectId ?? "",
    amount: income?.amount ?? 0,
    paymentDate: income?.paymentDate ?? "",
    status: income?.status ?? "pending",
    notes: income?.notes ?? "",
  });

  function updateField<K extends keyof IncomeInput>(
    name: K,
    value: IncomeInput[K],
  ) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);

      if (income?.id) {
        await updateIncome(income.id, form);
        toast.success("Income updated");
      } else {
        await createIncome(form);
        toast.success("Income created");
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
          <label className="text-sm font-medium">Amount</label>
          <input
            type="number"
            value={form.amount}
            onChange={(event) => updateField("amount", Number(event.target.value))}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Payment Date</label>
          <input
            type="date"
            value={form.paymentDate}
            onChange={(event) =>
              updateField("paymentDate", event.target.value)
            }
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            value={form.status}
            onChange={(event) =>
              updateField("status", event.target.value as IncomeInput["status"])
            }
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
        {loading ? "Saving..." : income ? "Update Income" : "Create Income"}
      </button>
    </form>
  );
}
