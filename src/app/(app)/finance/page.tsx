import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
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
      <PageHeader
        title="Finance"
        description="Track income, expenses, invoices, and monthly totals."
      />

      <FinanceSummaryCards summary={summary} />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {financeLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="crm-card p-5 text-sm font-medium text-crm-heading transition-colors hover:bg-[#f6f9fc]"
          >
            {item.title}
          </Link>
        ))}
      </div>
    </>
  );
}
