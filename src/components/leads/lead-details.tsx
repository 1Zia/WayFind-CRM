"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { convertLeadToClient, updateLeadStatus } from "@/lib/actions/leads";
import type { LeadStatus } from "@/lib/validations/lead";

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
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const isClosed = lead.status === "converted" || lead.status === "lost";
  const isFollowUpOverdue =
    lead.followUpDate &&
    !isClosed &&
    new Date(lead.followUpDate) < new Date(new Date().toDateString());

  async function handleConvert() {
    const confirmed = window.confirm("Convert this lead to a client?");

    if (!confirmed) {
      return;
    }

    try {
      setLoadingAction("convert");
      await convertLeadToClient(lead.id);
      toast.success("Lead converted to client");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleStatusChange(status: LeadStatus) {
    try {
      setLoadingAction(status);
      await updateLeadStatus(lead.id, status);
      toast.success("Lead status updated");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoadingAction(null);
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
        <div>
          <p className="text-zinc-500">Follow-up Date</p>
          <div className="mt-1 flex items-center gap-2 font-medium text-zinc-950">
            <span>{lead.followUpDate ?? "-"}</span>
            {isFollowUpOverdue ? (
              <StatusBadge tone="danger">overdue</StatusBadge>
            ) : null}
          </div>
        </div>
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
          className="liquid-glass-primary rounded-xl px-4 py-2 text-sm font-semibold text-slate-900 hover:shadow-theme-md"
        >
          Edit
        </Link>
        {canConvert && !isClosed ? (
          <>
            {lead.status !== "contacted" ? (
              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={() => handleStatusChange("contacted")}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60"
              >
                {loadingAction === "contacted" ? "Updating..." : "Mark Contacted"}
              </button>
            ) : null}
            {lead.status !== "proposal" ? (
              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={() => handleStatusChange("proposal")}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60"
              >
                {loadingAction === "proposal" ? "Updating..." : "Move to Proposal"}
              </button>
            ) : null}
            <button
              type="button"
              disabled={loadingAction !== null}
              onClick={handleConvert}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60"
            >
              {loadingAction === "convert" ? "Converting..." : "Convert to Client"}
            </button>
            <button
              type="button"
              disabled={loadingAction !== null}
              onClick={() => handleStatusChange("lost")}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              {loadingAction === "lost" ? "Updating..." : "Mark Lost"}
            </button>
          </>
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
