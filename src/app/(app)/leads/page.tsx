import Link from "next/link";

import { LeadPipeline } from "@/components/leads/lead-pipeline";
import { LeadTable } from "@/components/leads/lead-table";
import { PageHeader } from "@/components/shared/page-header";
import { ForbiddenState } from "@/components/shared/forbidden-state";
import { getLeads } from "@/lib/actions/leads";
import { requireUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { LiquidButton } from "@/components/ui/button";

type LeadsPageProps = {
  searchParams?: {
    search?: string;
    status?: string;
  };
};

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  let leads;
  let user;

  try {
    [leads, user] = await Promise.all([
      getLeads({
        search: searchParams?.search,
        status: searchParams?.status,
      }),
      requireUser(),
    ]);
  } catch {
    return <ForbiddenState />;
  }

  return (
    <>
      <PageHeader
        title="Leads"
        description="Track potential clients through the sales pipeline."
        action={
          hasPermission(user, "leads:create") ? (
            <LiquidButton href="/leads/new" size="default">
              New Lead
            </LiquidButton>
          ) : null
        }
      />

      <div className="mb-6">
        <LeadPipeline leads={leads} />
      </div>

      <form className="crm-card mb-4 grid gap-3 p-4 md:grid-cols-[1fr_180px_auto]">
        <input
          name="search"
          defaultValue={searchParams?.search ?? ""}
          className="crm-input mt-0"
          placeholder="Search leads..."
        />
        <select
          name="status"
          defaultValue={searchParams?.status ?? "all"}
          className="crm-input mt-0"
        >
          <option value="all">All statuses</option>
          <option value="new_lead">New Lead</option>
          <option value="contacted">Contacted</option>
          <option value="proposal">Proposal</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
        <button type="submit" className="crm-btn-secondary">
          Filter
        </button>
      </form>

      <LeadTable canDelete={hasPermission(user, "leads:delete")} leads={leads} />
    </>
  );
}
