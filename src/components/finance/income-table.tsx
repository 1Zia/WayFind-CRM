type IncomeRow = {
  id: string;
  clientId: string | null;
  projectId: string | null;
  amount: number;
  paymentDate: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  notes: string | null;
};

type Option = {
  id: string;
  name: string;
};

type IncomeTableProps = {
  income: IncomeRow[];
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

export function IncomeTable({
  income,
  clients = [],
  projects = [],
}: IncomeTableProps) {
  const clientNames = new Map(clients.map((client) => [client.id, client.name]));
  const projectNames = new Map(
    projects.map((project) => [project.id, project.name]),
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-zinc-50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Client</th>
            <th className="px-4 py-3 font-medium">Project</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Payment Date</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Notes</th>
          </tr>
        </thead>

        <tbody>
          {income.map((item) => (
            <tr key={item.id} className="border-b last:border-0">
              <td className="px-4 py-3">
                {item.clientId ? clientNames.get(item.clientId) ?? item.clientId : "-"}
              </td>
              <td className="px-4 py-3">
                {item.projectId
                  ? projectNames.get(item.projectId) ?? item.projectId
                  : "-"}
              </td>
              <td className="px-4 py-3">{formatMoney(item.amount)}</td>
              <td className="px-4 py-3">{item.paymentDate}</td>
              <td className="px-4 py-3 capitalize">{item.status}</td>
              <td className="px-4 py-3">{item.notes ?? "-"}</td>
            </tr>
          ))}

          {income.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                No income records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
