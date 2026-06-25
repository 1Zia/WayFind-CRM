import { ReportSummaryCards } from "@/components/reports/report-summary-cards";

type BusinessOverviewReportProps = {
  report: {
    totalClients: number;
    totalLeads: number;
    convertedLeads: number;
    activeProjects: number;
    completedProjects: number;
    pendingTasks: number;
    completedTasks: number;
    totalIncome: number;
    totalExpenses: number;
    profitLoss: number;
  };
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function BusinessOverviewReport({
  report,
}: BusinessOverviewReportProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Business Overview</h2>
      <ReportSummaryCards
        cards={[
          { title: "Total Clients", value: report.totalClients },
          { title: "Total Leads", value: report.totalLeads },
          { title: "Converted Leads", value: report.convertedLeads },
          { title: "Active Projects", value: report.activeProjects },
          { title: "Completed Projects", value: report.completedProjects },
          { title: "Pending Tasks", value: report.pendingTasks },
          { title: "Completed Tasks", value: report.completedTasks },
          { title: "Total Income", value: formatMoney(report.totalIncome) },
          { title: "Total Expenses", value: formatMoney(report.totalExpenses) },
          { title: "Profit / Loss", value: formatMoney(report.profitLoss) },
        ]}
      />
    </section>
  );
}
