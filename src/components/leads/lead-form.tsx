"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createLead, updateLead } from "@/lib/actions/leads";
import type { LeadInput } from "@/lib/validations/lead";

type LeadFormProps = {
  lead?: LeadInput & {
    id: string;
  };
};

export function LeadForm({ lead }: LeadFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<LeadInput>({
    leadName: lead?.leadName ?? "",
    company: lead?.company ?? "",
    contact: lead?.contact ?? "",
    email: lead?.email ?? "",
    phone: lead?.phone ?? "",
    source: lead?.source ?? "",
    status: lead?.status ?? "new_lead",
    followUpDate: lead?.followUpDate ?? "",
    notes: lead?.notes ?? "",
  });

  function updateField(name: keyof LeadInput, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);

      if (lead?.id) {
        await updateLead(lead.id, form);
        toast.success("Lead updated");
      } else {
        await createLead(form);
        toast.success("Lead created");
      }

      router.push("/leads");
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
        <Field
          label="Lead Name"
          value={form.leadName}
          onChange={(value) => updateField("leadName", value)}
          placeholder="Asifa Shabir"
        />
        <Field
          label="Company"
          value={form.company ?? ""}
          onChange={(value) => updateField("company", value)}
          placeholder="Dental Aesthetics"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Contact"
          value={form.contact ?? ""}
          onChange={(value) => updateField("contact", value)}
          placeholder="Primary contact"
        />
        <Field
          label="Email"
          type="email"
          value={form.email ?? ""}
          onChange={(value) => updateField("email", value)}
          placeholder="lead@example.com"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Phone"
          value={form.phone ?? ""}
          onChange={(value) => updateField("phone", value)}
          placeholder="+92..."
        />
        <Field
          label="Source"
          value={form.source ?? ""}
          onChange={(value) => updateField("source", value)}
          placeholder="Referral"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            value={form.status}
            onChange={(event) => updateField("status", event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="new_lead">New Lead</option>
            <option value="contacted">Contacted</option>
            <option value="proposal">Proposal</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
        <Field
          label="Follow-up Date"
          type="date"
          value={form.followUpDate ?? ""}
          onChange={(value) => updateField("followUpDate", value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Notes</label>
        <textarea
          value={form.notes ?? ""}
          onChange={(event) => updateField("notes", event.target.value)}
          className="mt-1 min-h-28 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Lead notes..."
        />
      </div>

      <button
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Saving..." : lead ? "Update Lead" : "Create Lead"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}
