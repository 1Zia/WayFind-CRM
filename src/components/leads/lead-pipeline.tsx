import type { LeadStatus } from "@/lib/validations/lead";
import { leadStatusLabels } from "@/components/leads/lead-status-badge";

type Lead = {
  status: LeadStatus;
};

const statuses: LeadStatus[] = [
  "new_lead",
  "contacted",
  "proposal",
  "converted",
  "lost",
];

export function LeadPipeline({ leads }: { leads: Lead[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {statuses.map((status) => {
        const count = leads.filter((lead) => lead.status === status).length;

        return (
          <div key={status} className="rounded-xl border bg-white p-4">
            <p className="text-sm text-zinc-500">{leadStatusLabels[status]}</p>
            <p className="mt-2 text-2xl font-semibold">{count}</p>
          </div>
        );
      })}
    </div>
  );
}
