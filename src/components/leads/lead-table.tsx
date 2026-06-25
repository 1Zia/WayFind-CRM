"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteLead } from "@/lib/actions/leads";
import type { LeadStatus } from "@/lib/validations/lead";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";

type Lead = {
  id: string;
  leadName: string;
  company: string | null;
  contact: string | null;
  source: string | null;
  status: LeadStatus;
  followUpDate: string | null;
  createdAt: Date;
};

type LeadTableProps = {
  leads: Lead[];
  canDelete: boolean;
};

export function LeadTable({ leads, canDelete }: LeadTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this lead?");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteLead(id);
      toast.success("Lead deleted");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-zinc-50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Lead</th>
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">Contact</th>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Follow-up</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b last:border-0">
              <td className="px-4 py-3 font-medium">{lead.leadName}</td>
              <td className="px-4 py-3">{lead.company ?? "-"}</td>
              <td className="px-4 py-3">{lead.contact ?? "-"}</td>
              <td className="px-4 py-3">{lead.source ?? "-"}</td>
              <td className="px-4 py-3">
                <LeadStatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-3">{lead.followUpDate ?? "-"}</td>
              <td className="px-4 py-3">{lead.createdAt.toLocaleString()}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="text-purple-600 hover:underline"
                  >
                    View
                  </Link>
                  <Link
                    href={`/leads/${lead.id}/edit`}
                    className="text-purple-600 hover:underline"
                  >
                    Edit
                  </Link>
                  {canDelete ? (
                    <button
                      type="button"
                      disabled={deletingId === lead.id}
                      onClick={() => handleDelete(lead.id)}
                      className="text-red-600 hover:underline disabled:opacity-60"
                    >
                      {deletingId === lead.id ? "Deleting..." : "Delete"}
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}

          {leads.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-zinc-500">
                No leads found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
