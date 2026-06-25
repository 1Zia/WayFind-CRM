type FinanceSummaryCardsProps = {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    profitLoss: number;
    unpaidInvoices: number;
  };
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function FinanceSummaryCards({ summary }: FinanceSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard title="Total Income" value={formatMoney(summary.totalIncome)} />
      <SummaryCard
        title="Total Expenses"
        value={formatMoney(summary.totalExpenses)}
      />
      <SummaryCard title="Profit / Loss" value={formatMoney(summary.profitLoss)} />
      <SummaryCard
        title="Unpaid Invoices"
        value={formatMoney(summary.unpaidInvoices)}
      />
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
