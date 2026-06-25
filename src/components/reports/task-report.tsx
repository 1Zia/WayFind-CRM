import { ReportSummaryCards } from "@/components/reports/report-summary-cards";

type TaskReportProps = {
  report: {
    totalTasks: number;
    tasksByStatus: Record<string, number>;
    tasksByPriority: Record<string, number>;
    overdueTasks: number;
    completedTasks: number;
  } | null;
};

export function TaskReport({ report }: TaskReportProps) {
  if (!report) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Tasks</h2>
      <ReportSummaryCards
        cards={[
          { title: "Total Tasks", value: report.totalTasks },
          { title: "Completed Tasks", value: report.completedTasks },
          { title: "Overdue Tasks", value: report.overdueTasks },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownTable title="Tasks by Status" rows={report.tasksByStatus} />
        <BreakdownTable title="Tasks by Priority" rows={report.tasksByPriority} />
      </div>
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
