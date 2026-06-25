import { ReportSummaryCards } from "@/components/reports/report-summary-cards";

type ProjectReportProps = {
  report: {
    totalProjects: number;
    projectsByStatus: Record<string, number>;
    activeProjects: number;
    completedProjects: number;
    cancelledProjects: number;
    totalProjectBudget: number;
  } | null;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProjectReport({ report }: ProjectReportProps) {
  if (!report) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Projects</h2>
      <ReportSummaryCards
        cards={[
          { title: "Total Projects", value: report.totalProjects },
          { title: "Active Projects", value: report.activeProjects },
          { title: "Completed Projects", value: report.completedProjects },
          { title: "Cancelled Projects", value: report.cancelledProjects },
          {
            title: "Total Project Budget",
            value: formatMoney(report.totalProjectBudget),
          },
        ]}
      />
      <BreakdownTable title="Projects by Status" rows={report.projectsByStatus} />
    </section>
  );
}

function BreakdownTable({
  title,
  rows,
}: {
  title: string;
  rows: Record<string, number>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="border-b px-4 py-3 font-medium">{title}</div>
      <table className="w-full text-sm">
        <tbody>
          {Object.entries(rows).map(([label, value]) => (
            <tr key={label} className="border-b last:border-0">
              <td className="px-4 py-3 capitalize">{label.replace("_", " ")}</td>
              <td className="px-4 py-3 text-right">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
