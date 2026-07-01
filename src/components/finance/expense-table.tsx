"use client";

import {
  useMemo,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  Edit3,
  MoreHorizontal,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  createExpense,
  deleteExpense,
  updateExpense,
} from "@/lib/actions/finance";
import type { ExpenseInput } from "@/lib/validations/finance";

type ExpenseRow = {
  id: string;
  title: string;
  category:
    | "salary"
    | "rent"
    | "software"
    | "marketing"
    | "travel"
    | "utilities"
    | "miscellaneous";
  amount: number;
  date: string;
  approvedBy: string | null;
  notes: string | null;
};

type Option = {
  id: string;
  name: string;
};

type ExpenseTableProps = {
  expenses: ExpenseRow[];
  users?: Option[];
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

function toInput(expense: ExpenseRow): ExpenseInput {
  return {
    title: expense.title,
    category: expense.category,
    amount: expense.amount,
    date: expense.date,
    approvedBy: expense.approvedBy ?? "",
    notes: expense.notes ?? "",
  };
}

export function ExpenseTable({ expenses, users = [] }: ExpenseTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ExpenseRow | null>(null);
  const [form, setForm] = useState<ExpenseInput | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const userNames = useMemo(
    () => new Map(users.map((user) => [user.id, user.name])),
    [users],
  );

  const filteredExpenses = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return expenses;
    }

    return expenses.filter((expense) => {
      const searchable = [
        expense.title,
        expense.category.replace("_", " "),
        expense.amount.toString(),
        expense.date,
        expense.approvedBy ? userNames.get(expense.approvedBy) : null,
        expense.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(needle);
    });
  }, [expenses, query, userNames]);

  function refreshWithToast<T>(
    action: () => Promise<T>,
    successMessage: string,
  ) {
    startTransition(async () => {
      try {
        await action();
        toast.success(successMessage);
        setOpenMenuId(null);
        setEditing(null);
        setForm(null);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      }
    });
  }

  function startEdit(expense: ExpenseRow) {
    setEditing(expense);
    setForm(toInput(expense));
    setOpenMenuId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editing || !form) {
      return;
    }

    refreshWithToast(
      () => updateExpense(editing.id, form),
      "Expense updated",
    );
  }

  function handleDelete(expense: ExpenseRow) {
    if (!window.confirm("Delete this expense?")) {
      return;
    }

    refreshWithToast(() => deleteExpense(expense.id), "Expense deleted");
  }

  function updateField<K extends keyof ExpenseInput>(
    name: K,
    value: ExpenseInput[K],
  ) {
    setForm((current) => (current ? { ...current, [name]: value } : current));
  }

  function duplicateExpense(expense: ExpenseRow) {
    refreshWithToast(
      () => createExpense(toInput(expense)),
      "Expense duplicated",
    );
  }

  function markApproved(expense: ExpenseRow) {
    const approverId = expense.approvedBy ?? users[0]?.id ?? "";
    refreshWithToast(
      () => updateExpense(expense.id, { ...toInput(expense), approvedBy: approverId }),
      "Expense marked approved",
    );
  }

  async function copyId(id: string) {
    await navigator.clipboard.writeText(id);
    toast.success("Expense ID copied");
    setOpenMenuId(null);
  }

  return (
    <>
      <div className="space-y-3">
        <div className="liquid-glass flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative flex h-11 min-w-0 flex-1 items-center">
            <Search className="pointer-events-none absolute left-3.5 h-4.5 w-4.5 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search expenses..."
              className="h-full w-full rounded-xl border border-white/70 bg-white/45 pl-10 pr-3 text-sm font-medium text-crm-heading outline-none shadow-theme-xs backdrop-blur-xl placeholder:text-gray-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-300/30"
            />
          </label>
          <div className="text-xs font-semibold text-gray-500">
            {filteredExpenses.length} of {expenses.length} records
          </div>
        </div>

        <div className="crm-card overflow-visible">
          <table className="w-full text-sm">
            <thead className="crm-table-head text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Approved By</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="crm-table-row">
                  <td className="crm-table-cell font-medium">
                    {expense.title}
                  </td>
                  <td className="crm-table-cell capitalize">
                    {expense.category.replace("_", " ")}
                  </td>
                  <td className="crm-table-cell">
                    {formatMoney(expense.amount)}
                  </td>
                  <td className="crm-table-cell">{expense.date}</td>
                  <td className="crm-table-cell">
                    {expense.approvedBy
                      ? userNames.get(expense.approvedBy) ?? expense.approvedBy
                      : "-"}
                  </td>
                  <td className="crm-table-cell max-w-[260px] truncate">
                    {expense.notes ?? "-"}
                  </td>
                  <td className="crm-table-cell">
                    <div className="relative flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(expense)}
                        className="liquid-glass inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 hover:text-slate-950"
                        title="Edit expense"
                      >
                        <Edit3 className="relative z-10 h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(expense)}
                        className="liquid-glass inline-flex h-9 w-9 items-center justify-center rounded-xl text-red-500 hover:text-red-700"
                        title="Delete expense"
                      >
                        <Trash2 className="relative z-10 h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId((current) =>
                            current === expense.id ? null : expense.id,
                          )
                        }
                        className="liquid-glass inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 hover:text-slate-950"
                        title="More expense actions"
                      >
                        <MoreHorizontal className="relative z-10 h-4 w-4" />
                      </button>

                      {openMenuId === expense.id ? (
                        <div className="absolute right-0 top-11 z-30 w-48 overflow-hidden rounded-xl border border-white/70 bg-white/80 p-1 shadow-theme-lg backdrop-blur-xl">
                          <ActionItem onClick={() => markApproved(expense)}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Mark approved
                          </ActionItem>
                          <ActionItem onClick={() => duplicateExpense(expense)}>
                            Duplicate
                          </ActionItem>
                          <ActionItem onClick={() => copyId(expense.id)}>
                            <Copy className="h-3.5 w-3.5" />
                            Copy ID
                          </ActionItem>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-zinc-500"
                  >
                    <div className="font-medium text-zinc-950">
                      {expenses.length === 0
                        ? "No expenses yet."
                        : "No expenses match your search."}
                    </div>
                    <div className="mt-1 text-sm">
                      Operating expenses will appear here.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && form ? (
        <div className="fixed inset-0 z-[9998] flex items-start justify-center bg-slate-900/25 p-4 pt-24 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="liquid-glass w-full max-w-2xl rounded-2xl p-5"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit expense</h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl p-2 text-gray-500 hover:bg-white/50 hover:text-slate-950"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <Field label="Title">
              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className="crm-input bg-white/65"
              />
            </Field>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(event) =>
                    updateField(
                      "category",
                      event.target.value as ExpenseInput["category"],
                    )
                  }
                  className="crm-input bg-white/65"
                >
                  <option value="salary">Salary</option>
                  <option value="rent">Rent</option>
                  <option value="software">Software</option>
                  <option value="marketing">Marketing</option>
                  <option value="travel">Travel</option>
                  <option value="utilities">Utilities</option>
                  <option value="miscellaneous">Miscellaneous</option>
                </select>
              </Field>
              <Field label="Amount">
                <input
                  type="number"
                  value={form.amount}
                  onChange={(event) =>
                    updateField("amount", Number(event.target.value))
                  }
                  className="crm-input bg-white/65"
                />
              </Field>
              <Field label="Date">
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => updateField("date", event.target.value)}
                  className="crm-input bg-white/65"
                />
              </Field>
            </div>

            <Field label="Approved By" className="mt-4">
              <select
                value={form.approvedBy ?? ""}
                onChange={(event) =>
                  updateField("approvedBy", event.target.value)
                }
                className="crm-input bg-white/65"
              >
                <option value="">Not approved</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Notes" className="mt-4">
              <textarea
                value={form.notes ?? ""}
                onChange={(event) => updateField("notes", event.target.value)}
                className="crm-input min-h-24 bg-white/65"
              />
            </Field>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="crm-btn-secondary bg-white/70"
              >
                Cancel
              </button>
              <button
                disabled={isPending}
                className="liquid-glass-primary rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

function ActionItem({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-600 hover:bg-white/70 hover:text-slate-950"
    >
      {children}
    </button>
  );
}

function Field({
  children,
  className = "",
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={className}>
      <span className="crm-label">{label}</span>
      {children}
    </label>
  );
}
