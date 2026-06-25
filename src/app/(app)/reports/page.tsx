import { BusinessOverviewReport } from "@/components/reports/business-overview-report";
import { FinanceReport } from "@/components/reports/finance-report";
import { LeadReport } from "@/components/reports/lead-report";
import { ProjectReport } from "@/components/reports/project-report";
import { TaskReport } from "@/components/reports/task-report";
import { getReportsPageData } from "@/lib/actions/reports";

export default async function ReportsPage() {
  let reports;

  try {
    reports = await getReportsPageData();
  } catch {
    return <ForbiddenMessage />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Analyze company performance, projects, tasks, leads, and financial
          activity.
        </p>
      </div>

      <div className="space-y-8">
        <BusinessOverviewReport report={reports.overview} />
        <FinanceReport report={reports.finance} />
        <ProjectReport report={reports.project} />
        <TaskReport report={reports.task} />
        <LeadReport report={reports.lead} />
      </div>
    </>
  );
}

function ForbiddenMessage() {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Reports access required
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        You do not have permission to view reports.
      </p>
    </div>
  );
}
