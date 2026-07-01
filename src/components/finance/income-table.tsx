"use client";

import {
  useMemo,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Copy,
  Edit3,
  MoreHorizontal,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  createIncome,
  deleteIncome,
  updateIncome,
} from "@/lib/actions/finance";
import type { IncomeInput } from "@/lib/validations/finance";

type IncomeRow = {
  id: string;
  clientId: string | null;
  projectId: string | null;
  amount: number;
  paymentDate: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  notes: string | null;
};

type Option = {
  id: string;
  name: string;
};

type IncomeTableProps = {
  income: IncomeRow[];
  clients?: Option[];
  projects?: Option[];
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

function toInput(item: IncomeRow): IncomeInput {
  return {
    clientId: item.clientId ?? "",
    projectId: item.projectId ?? "",
    amount: item.amount,
    paymentDate: item.paymentDate,
    status: item.status,
    notes: item.notes ?? "",
  };
}

export function IncomeTable({
  income,
  clients = [],
  projects = [],
}: IncomeTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<IncomeRow | null>(null);
  const [form, setForm] = useState<IncomeInput | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const clientNames = useMemo(
    () => new Map(clients.map((client) => [client.id, client.name])),
    [clients],
  );
  const projectNames = useMemo(
    () => new Map(projects.map((project) => [project.id, project.name])),
    [projects],
  );

  const filteredIncome = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return income;
    }

    return income.filter((item) => {
      const searchable = [
        clientNames.get(item.clientId ?? "") ?? item.clientId,
        projectNames.get(item.projectId ?? "") ?? item.projectId,
        item.amount.toString(),
        item.paymentDate,
        item.status,
        item.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(needle);
    });
  }, [clientNames, income, projectNames, query]);

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

  function startEdit(item: IncomeRow) {
    setEditing(item);
    setForm(toInput(item));
    setOpenMenuId(null);
  }

  function handleDelete(item: IncomeRow) {
    if (!window.confirm("Delete this income record?")) {
      return;
    }

    refreshWithToast(() => deleteIncome(item.id), "Income deleted");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editing || !form) {
      return;
    }

    refreshWithToast(
      () => updateIncome(editing.id, form),
      "Income record updated",
    );
  }

  function updateField<K extends keyof IncomeInput>(
    name: K,
    value: IncomeInput[K],
  ) {
    setForm((current) => (current ? { ...current, [name]: value } : current));
  }

  function changeStatus(item: IncomeRow, status: IncomeRow["status"]) {
    refreshWithToast(
      () => updateIncome(item.id, { ...toInput(item), status }),
      `Marked as ${status}`,
    );
  }

  function duplicateIncome(item: IncomeRow) {
    refreshWithToast(
      () => createIncome({ ...toInput(item), status: "pending" }),
      "Income duplicated as pending",
    );
  }

  async function copyId(id: string) {
    await navigator.clipboard.writeText(id);
    toast.success("Income ID copied");
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
              placeholder="Search income..."
              className="h-full w-full rounded-xl border border-white/70 bg-white/45 pl-10 pr-3 text-sm font-medium text-crm-heading outline-none shadow-theme-xs backdrop-blur-xl placeholder:text-gray-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-300/30"
            />
          </label>
          <div className="text-xs font-semibold text-gray-500">
            {filteredIncome.length} of {income.length} records
          </div>
        </div>

        <div className="overflow-visible rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-zinc-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Payment Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredIncome.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    {item.clientId ? (
                      <Link
                        href={`/clients/${item.clientId}`}
                        className="text-purple-600 hover:underline"
                      >
                        {clientNames.get(item.clientId) ?? item.clientId}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.projectId ? (
                      <Link
                        href={`/projects/${item.projectId}`}
                        className="text-purple-600 hover:underline"
                      >
                        {projectNames.get(item.projectId) ?? item.projectId}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3">{formatMoney(item.amount)}</td>
                  <td className="px-4 py-3">{item.paymentDate}</td>
                  <td className="px-4 py-3 capitalize">{item.status}</td>
                  <td className="max-w-[260px] truncate px-4 py-3">
                    {item.notes ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="liquid-glass inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 hover:text-slate-950"
                        title="Edit income"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="liquid-glass inline-flex h-9 w-9 items-center justify-center rounded-xl text-red-500 hover:text-red-700"
                        title="Delete income"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId((current) =>
                            current === item.id ? null : item.id,
                          )
                        }
                        className="liquid-glass inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 hover:text-slate-950"
                        title="More income actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {openMenuId === item.id ? (
                        <div className="absolute right-0 top-11 z-30 w-48 overflow-hidden rounded-xl border border-white/70 bg-white/80 p-1 shadow-theme-lg backdrop-blur-xl">
                          <ActionItem onClick={() => changeStatus(item, "paid")}>
                            Mark as paid
                          </ActionItem>
                          <ActionItem
                            onClick={() => changeStatus(item, "pending")}
                          >
                            Mark as pending
                          </ActionItem>
                          <ActionItem onClick={() => duplicateIncome(item)}>
                            Duplicate
                          </ActionItem>
                          <ActionItem onClick={() => copyId(item.id)}>
                            <Copy className="h-3.5 w-3.5" />
                            Copy ID
                          </ActionItem>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredIncome.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-zinc-500"
                  >
                    <div className="font-medium text-zinc-950">
                      {income.length === 0
                        ? "No income records yet."
                        : "No income matches your search."}
                    </div>
                    <div className="mt-1 text-sm">
                      Paid and pending income will appear here.
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
              <h2 className="text-lg font-semibold">Edit income</h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl p-2 text-gray-500 hover:bg-white/50 hover:text-slate-950"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Client">
                <select
                  value={form.clientId ?? ""}
                  onChange={(event) =>
                    updateField("clientId", event.target.value)
                  }
                  className="crm-input bg-white/65"
                >
                  <option value="">No client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Project">
                <select
                  value={form.projectId ?? ""}
                  onChange={(event) =>
                    updateField("projectId", event.target.value)
                  }
                  className="crm-input bg-white/65"
                >
                  <option value="">No project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
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
              <Field label="Payment Date">
                <input
                  type="date"
                  value={form.paymentDate}
                  onChange={(event) =>
                    updateField("paymentDate", event.target.value)
                  }
                  className="crm-input bg-white/65"
                />
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateField(
                      "status",
                      event.target.value as IncomeInput["status"],
                    )
                  }
                  className="crm-input bg-white/65"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </Field>
            </div>

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
