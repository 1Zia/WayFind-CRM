import Link from "next/link";

import { FinanceAccessMessage } from "@/components/finance/finance-access-message";
import { FinanceSummaryCards } from "@/components/finance/finance-summary-cards";
import { getFinanceSummary } from "@/lib/actions/finance";

const financeLinks = [
  {
    title: "Income",
    href: "/finance/income",
  },
  {
    title: "Expenses",
    href: "/finance/expenses",
  },
  {
    title: "Invoices",
    href: "/finance/invoices",
  },
  {
    title: "Reports",
    href: "/finance/reports",
  },
];

export default async function FinancePage() {
  let summary;

  try {
    summary = await getFinanceSummary();
  } catch {
    return <FinanceAccessMessage />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Track income, expenses, invoices, and monthly totals.
        </p>
      </div>

      <FinanceSummaryCards summary={summary} />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {financeLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border bg-white p-5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            {item.title}
          </Link>
        ))}
      </div>
    </>
  );
}
