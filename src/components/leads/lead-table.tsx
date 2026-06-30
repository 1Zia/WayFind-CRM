"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmptyRow,
  DataTableHead,
  DataTableHeadCell,
  DataTableRow,
  DataTableWrapper,
} from "@/components/shared/data-table-wrapper";
import { EmptyState } from "@/components/shared/empty-state";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { deleteLead } from "@/lib/actions/leads";
import type { LeadStatus } from "@/lib/validations/lead";

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
    <DataTableWrapper>
      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableHeadCell>Lead</DataTableHeadCell>
            <DataTableHeadCell>Company</DataTableHeadCell>
            <DataTableHeadCell>Contact</DataTableHeadCell>
            <DataTableHeadCell>Source</DataTableHeadCell>
            <DataTableHeadCell>Status</DataTableHeadCell>
            <DataTableHeadCell>Follow-up</DataTableHeadCell>
            <DataTableHeadCell>Created</DataTableHeadCell>
            <DataTableHeadCell>Actions</DataTableHeadCell>
          </tr>
        </DataTableHead>

        <DataTableBody>
          {leads.map((lead) => (
            <DataTableRow key={lead.id}>
              <DataTableCell className="font-medium">{lead.leadName}</DataTableCell>
              <DataTableCell>{lead.company ?? "-"}</DataTableCell>
              <DataTableCell>{lead.contact ?? "-"}</DataTableCell>
              <DataTableCell>{lead.source ?? "-"}</DataTableCell>
              <DataTableCell>
                <LeadStatusBadge status={lead.status} />
              </DataTableCell>
              <DataTableCell>{lead.followUpDate ?? "-"}</DataTableCell>
              <DataTableCell>{lead.createdAt.toLocaleString()}</DataTableCell>
              <DataTableCell>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="crm-action-link"
                  >
                    View
                  </Link>
                  <Link
                    href={`/leads/${lead.id}/edit`}
                    className="crm-action-link"
                  >
                    Edit
                  </Link>
                  {canDelete ? (
                    <button
                      type="button"
                      disabled={deletingId === lead.id}
                      onClick={() => handleDelete(lead.id)}
                      className="crm-action-link-danger"
                    >
                      {deletingId === lead.id ? "Deleting..." : "Delete"}
                    </button>
                  ) : null}
                </div>
              </DataTableCell>
            </DataTableRow>
          ))}

          {leads.length === 0 ? (
            <DataTableEmptyRow colSpan={8}>
              <EmptyState
                compact
                title="No leads yet"
                description="Leads will appear here as they enter the sales pipeline."
              />
            </DataTableEmptyRow>
          ) : null}
        </DataTableBody>
      </DataTable>
    </DataTableWrapper>
  );
}
