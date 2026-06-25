type InvoiceRow = {
  id: string;
  clientId: string | null;
  projectId: string | null;
  invoiceNumber: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  paidAt: string | null;
};

type Option = {
  id: string;
  name: string;
};

type InvoiceTableProps = {
  invoices: InvoiceRow[];
  clients?: Option[];
  projects?: Option[];
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function InvoiceTable({
  invoices,
  clients = [],
  projects = [],
}: InvoiceTableProps) {
  const clientNames = new Map(clients.map((client) => [client.id, client.name]));
  const projectNames = new Map(
    projects.map((project) => [project.id, project.name]),
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-zinc-50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Invoice</th>
            <th className="px-4 py-3 font-medium">Client</th>
            <th className="px-4 py-3 font-medium">Project</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Due Date</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b last:border-0">
              <td className="px-4 py-3 font-medium">
                {invoice.invoiceNumber}
              </td>
              <td className="px-4 py-3">
                {invoice.clientId
                  ? clientNames.get(invoice.clientId) ?? invoice.clientId
                  : "-"}
              </td>
              <td className="px-4 py-3">
                {invoice.projectId
                  ? projectNames.get(invoice.projectId) ?? invoice.projectId
                  : "-"}
              </td>
              <td className="px-4 py-3">{formatMoney(invoice.amount)}</td>
              <td className="px-4 py-3 capitalize">{invoice.status}</td>
              <td className="px-4 py-3">{invoice.dueDate}</td>
            </tr>
          ))}

          {invoices.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                No invoices found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
