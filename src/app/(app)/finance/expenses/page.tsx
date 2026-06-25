import { ExpenseForm } from "@/components/finance/expense-form";
import { ExpenseTable } from "@/components/finance/expense-table";
import { FinanceAccessMessage } from "@/components/finance/finance-access-message";
import { getExpenses, getFinanceFormOptions } from "@/lib/actions/finance";

export default async function FinanceExpensesPage() {
  let data;

  try {
    data = await Promise.all([getExpenses(), getFinanceFormOptions()]);
  } catch {
    return <FinanceAccessMessage />;
  }

  const [expenses, options] = data;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Track operating expenses and approvals.
        </p>
      </div>

      <ExpenseForm users={options.users} />

      <div className="mt-6">
        <ExpenseTable expenses={expenses} users={options.users} />
      </div>
    </>
  );
}
