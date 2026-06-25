import Link from "next/link";

import { LeadPipeline } from "@/components/leads/lead-pipeline";
import { LeadTable } from "@/components/leads/lead-table";
import { ForbiddenState } from "@/components/shared/forbidden-state";
import { getLeads } from "@/lib/actions/leads";
import { requireUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

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
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track potential clients through the sales pipeline.
          </p>
        </div>

        {hasPermission(user, "leads:create") ? (
          <Link
            href="/leads/new"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            New Lead
          </Link>
        ) : null}
      </div>

      <div className="mb-6">
        <LeadPipeline leads={leads} />
      </div>

      <form className="mb-4 grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-[1fr_180px_auto]">
        <input
          name="search"
          defaultValue={searchParams?.search ?? ""}
          className="rounded-lg border px-3 py-2 text-sm"
          placeholder="Search leads..."
        />
        <select
          name="status"
          defaultValue={searchParams?.status ?? "all"}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="new_lead">New Lead</option>
          <option value="contacted">Contacted</option>
          <option value="proposal">Proposal</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
        <button className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50">
          Filter
        </button>
      </form>

      <LeadTable canDelete={hasPermission(user, "leads:delete")} leads={leads} />
    </>
  );
}
