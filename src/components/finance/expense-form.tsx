"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createExpense, updateExpense } from "@/lib/actions/finance";
import type { ExpenseInput } from "@/lib/validations/finance";

type Option = {
  id: string;
  name: string;
};

type ExpenseFormProps = {
  expense?: ExpenseInput & { id: string };
  users?: Option[];
};

export function ExpenseForm({ expense, users = [] }: ExpenseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ExpenseInput>({
    title: expense?.title ?? "",
    category: expense?.category ?? "miscellaneous",
    amount: expense?.amount ?? 0,
    date: expense?.date ?? "",
    approvedBy: expense?.approvedBy ?? "",
    notes: expense?.notes ?? "",
  });

  function updateField<K extends keyof ExpenseInput>(
    name: K,
    value: ExpenseInput[K],
  ) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);

      if (expense?.id) {
        await updateExpense(expense.id, form);
        toast.success("Expense updated");
      } else {
        await createExpense(form);
        toast.success("Expense created");
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
      <div>
        <label className="text-sm font-medium">Title</label>
        <input
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Expense title"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Category</label>
          <select
            value={form.category}
            onChange={(event) =>
              updateField(
                "category",
                event.target.value as ExpenseInput["category"],
              )
            }
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="salary">Salary</option>
            <option value="rent">Rent</option>
            <option value="software">Software</option>
            <option value="marketing">Marketing</option>
            <option value="travel">Travel</option>
            <option value="utilities">Utilities</option>
            <option value="miscellaneous">Miscellaneous</option>
          </select>
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
          <label className="text-sm font-medium">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(event) => updateField("date", event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Approved By</label>
        <select
          value={form.approvedBy ?? ""}
          onChange={(event) => updateField("approvedBy", event.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Not approved</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
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
        {loading ? "Saving..." : expense ? "Update Expense" : "Create Expense"}
      </button>
    </form>
  );
}
