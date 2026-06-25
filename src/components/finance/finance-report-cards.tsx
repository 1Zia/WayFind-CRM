type MonthlyTotal = {
  month: string;
  income: number;
  expenses: number;
  profitLoss: number;
};

type ProjectRevenue = {
  projectId: string;
  projectName: string;
  revenue: number;
};

type FinanceReportCardsProps = {
  monthlyTotals: MonthlyTotal[];
  projectRevenue: ProjectRevenue[];
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function FinanceReportCards({
  monthlyTotals,
  projectRevenue,
}: FinanceReportCardsProps) {
  const latestMonth = monthlyTotals[0];
  const topProject = projectRevenue[0];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <ReportCard
        title="Latest Month Income"
        value={latestMonth ? formatMoney(latestMonth.income) : formatMoney(0)}
      />
      <ReportCard
        title="Latest Month Expenses"
        value={latestMonth ? formatMoney(latestMonth.expenses) : formatMoney(0)}
      />
      <ReportCard
        title="Latest Month Profit / Loss"
        value={latestMonth ? formatMoney(latestMonth.profitLoss) : formatMoney(0)}
      />
      <ReportCard
        title="Top Project Revenue"
        value={topProject ? formatMoney(topProject.revenue) : formatMoney(0)}
        detail={topProject?.projectName ?? "No project revenue yet"}
      />
    </div>
  );
}

function ReportCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {detail ? <p className="mt-1 text-xs text-zinc-500">{detail}</p> : null}
    </div>
  );
}
