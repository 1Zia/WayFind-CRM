import { BusinessOverviewReport } from "@/components/reports/business-overview-report";
import { FinanceReport } from "@/components/reports/finance-report";
import { LeadReport } from "@/components/reports/lead-report";
import { ProjectReport } from "@/components/reports/project-report";
import { TaskReport } from "@/components/reports/task-report";
import {
  getBusinessOverviewReport,
  getFinanceReport,
  getLeadReport,
  getProjectReport,
  getTaskReport,
} from "@/lib/actions/reports";

export default async function ReportsPage() {
  let reports;

  try {
    reports = await Promise.all([
      getBusinessOverviewReport(),
      getFinanceReport(),
      getProjectReport(),
      getTaskReport(),
      getLeadReport(),
    ]);
  } catch {
    return <ForbiddenMessage />;
  }

  const [overview, finance, project, task, lead] = reports;

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
        <BusinessOverviewReport report={overview} />
        <FinanceReport report={finance} />
        <ProjectReport report={project} />
        <TaskReport report={task} />
        <LeadReport report={lead} />
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
