import { FinanceAccessMessage } from "@/components/finance/finance-access-message";
import { FinanceReportCards } from "@/components/finance/finance-report-cards";
import { getFinanceReports } from "@/lib/actions/finance";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function FinanceReportsPage() {
  let reports;

  try {
    reports = await getFinanceReports();
  } catch {
    return <FinanceAccessMessage />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Finance Reports
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Simple monthly totals and project revenue.
        </p>
      </div>

      <FinanceReportCards
        monthlyTotals={reports.monthlyTotals}
        projectRevenue={reports.projectRevenue}
      />

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-zinc-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Month</th>
              <th className="px-4 py-3 font-medium">Income</th>
              <th className="px-4 py-3 font-medium">Expenses</th>
              <th className="px-4 py-3 font-medium">Profit / Loss</th>
            </tr>
          </thead>

          <tbody>
            {reports.monthlyTotals.map((row) => (
              <tr key={row.month} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{row.month}</td>
                <td className="px-4 py-3">{formatMoney(row.income)}</td>
                <td className="px-4 py-3">{formatMoney(row.expenses)}</td>
                <td className="px-4 py-3">{formatMoney(row.profitLoss)}</td>
              </tr>
            ))}

            {reports.monthlyTotals.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-zinc-500"
                >
                  No monthly finance data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Project Revenue</h2>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b bg-zinc-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Revenue</th>
            </tr>
          </thead>

          <tbody>
            {reports.projectRevenue.map((project) => (
              <tr key={project.projectId} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">
                  {project.projectName}
                </td>
                <td className="px-4 py-3">{formatMoney(project.revenue)}</td>
              </tr>
            ))}

            {reports.projectRevenue.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-10 text-center text-zinc-500"
                >
                  No project revenue found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
