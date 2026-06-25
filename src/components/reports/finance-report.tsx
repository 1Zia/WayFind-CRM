import { ReportSummaryCards } from "@/components/reports/report-summary-cards";

type FinanceReportProps = {
  report: {
    totalIncome: number;
    totalExpenses: number;
    profitLoss: number;
    unpaidInvoices: number;
    paidIncomeTotal: number;
    pendingIncomeTotal: number;
    monthlyIncome: { month: string; amount: number }[];
    monthlyExpenses: { month: string; amount: number }[];
  } | null;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function FinanceReport({ report }: FinanceReportProps) {
  if (!report) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Finance</h2>
      <ReportSummaryCards
        cards={[
          { title: "Total Income", value: formatMoney(report.totalIncome) },
          { title: "Paid Income", value: formatMoney(report.paidIncomeTotal) },
          {
            title: "Pending Income",
            value: formatMoney(report.pendingIncomeTotal),
          },
          { title: "Total Expenses", value: formatMoney(report.totalExpenses) },
          { title: "Profit / Loss", value: formatMoney(report.profitLoss) },
          { title: "Unpaid Invoices", value: formatMoney(report.unpaidInvoices) },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyTable title="Monthly Income" rows={report.monthlyIncome} />
        <MonthlyTable title="Monthly Expenses" rows={report.monthlyExpenses} />
      </div>
    </section>
  );
}

function MonthlyTable({
  title,
  rows,
}: {
  title: string;
  rows: { month: string; amount: number }[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="border-b px-4 py-3 font-medium">{title}</div>
      <table className="w-full text-sm">
        <tbody>
          {rows.slice(0, 6).map((row) => (
            <tr key={row.month} className="border-b last:border-0">
              <td className="px-4 py-3">{row.month}</td>
              <td className="px-4 py-3 text-right">
                {formatMoney(row.amount)}
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-zinc-500" colSpan={2}>
                No monthly data.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
