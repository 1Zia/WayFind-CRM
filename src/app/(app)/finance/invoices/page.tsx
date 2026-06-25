import { FinanceAccessMessage } from "@/components/finance/finance-access-message";
import { InvoiceForm } from "@/components/finance/invoice-form";
import { InvoiceTable } from "@/components/finance/invoice-table";
import { getFinanceFormOptions, getInvoices } from "@/lib/actions/finance";

export default async function FinanceInvoicesPage() {
  let data;

  try {
    data = await Promise.all([getInvoices(), getFinanceFormOptions()]);
  } catch {
    return <FinanceAccessMessage />;
  }

  const [invoices, options] = data;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Create and track client invoices.
        </p>
      </div>

      <InvoiceForm clients={options.clients} projects={options.projects} />

      <div className="mt-6">
        <InvoiceTable
          clients={options.clients}
          invoices={invoices}
          projects={options.projects}
        />
      </div>
    </>
  );
}
