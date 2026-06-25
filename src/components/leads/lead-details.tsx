"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { convertLeadToClient } from "@/lib/actions/leads";
import type { LeadStatus } from "@/lib/validations/lead";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";

type Lead = {
  id: string;
  leadName: string;
  company: string | null;
  contact: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  followUpDate: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type LeadDetailsProps = {
  lead: Lead;
  canConvert: boolean;
};

export function LeadDetails({ lead, canConvert }: LeadDetailsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConvert() {
    const confirmed = window.confirm("Convert this lead to a client?");

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      await convertLeadToClient(lead.id);
      toast.success("Lead converted to client");
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
    <div className="space-y-6 rounded-xl border bg-white p-6">
      <div className="grid gap-4 text-sm md:grid-cols-2">
        <Detail label="Lead Name" value={lead.leadName} />
        <Detail label="Company" value={lead.company ?? "-"} />
        <Detail label="Contact" value={lead.contact ?? "-"} />
        <Detail label="Email" value={lead.email ?? "-"} />
        <Detail label="Phone" value={lead.phone ?? "-"} />
        <Detail label="Source" value={lead.source ?? "-"} />
        <div>
          <p className="text-zinc-500">Status</p>
          <div className="mt-1">
            <LeadStatusBadge status={lead.status} />
          </div>
        </div>
        <Detail label="Follow-up Date" value={lead.followUpDate ?? "-"} />
        <Detail label="Created" value={lead.createdAt.toLocaleString()} />
        <Detail label="Updated" value={lead.updatedAt.toLocaleString()} />
      </div>

      <div>
        <p className="text-sm text-zinc-500">Notes</p>
        <div className="mt-1 whitespace-pre-wrap text-sm">
          {lead.notes ?? "-"}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/leads/${lead.id}/edit`}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Edit
        </Link>
        {canConvert && lead.status !== "converted" ? (
          <button
            type="button"
            disabled={loading}
            onClick={handleConvert}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60"
          >
            {loading ? "Converting..." : "Convert to Client"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-zinc-500">{label}</p>
      <div className="mt-1 font-medium text-zinc-950">{value}</div>
    </div>
  );
}
