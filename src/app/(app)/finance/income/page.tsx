import { FinanceAccessMessage } from "@/components/finance/finance-access-message";
import { IncomeForm } from "@/components/finance/income-form";
import { IncomeTable } from "@/components/finance/income-table";
import { getFinanceFormOptions, getIncome } from "@/lib/actions/finance";

export default async function FinanceIncomePage() {
  let data;

  try {
    data = await Promise.all([getIncome(), getFinanceFormOptions()]);
  } catch {
    return <FinanceAccessMessage />;
  }

  const [income, options] = data;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Income</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Record client and project payments.
        </p>
      </div>

      <IncomeForm clients={options.clients} projects={options.projects} />

      <div className="mt-6">
        <IncomeTable
          clients={options.clients}
          income={income}
          projects={options.projects}
        />
      </div>
    </>
  );
}
