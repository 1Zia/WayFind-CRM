import type { LeadStatus } from "@/lib/validations/lead";

const labels: Record<LeadStatus, string> = {
  new_lead: "New Lead",
  contacted: "Contacted",
  proposal: "Proposal",
  converted: "Converted",
  lost: "Lost",
};

const classes: Record<LeadStatus, string> = {
  new_lead: "bg-purple-50 text-purple-700",
  contacted: "bg-blue-50 text-blue-700",
  proposal: "bg-amber-50 text-amber-700",
  converted: "bg-emerald-50 text-emerald-700",
  lost: "bg-red-50 text-red-700",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${classes[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export const leadStatusLabels = labels;
