type ExpenseRow = {
  id: string;
  title: string;
  category:
    | "salary"
    | "rent"
    | "software"
    | "marketing"
    | "travel"
    | "utilities"
    | "miscellaneous";
  amount: number;
  date: string;
  approvedBy: string | null;
  notes: string | null;
};

type Option = {
  id: string;
  name: string;
};

type ExpenseTableProps = {
  expenses: ExpenseRow[];
  users?: Option[];
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ExpenseTable({ expenses, users = [] }: ExpenseTableProps) {
  const userNames = new Map(users.map((user) => [user.id, user.name]));

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-zinc-50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Approved By</th>
            <th className="px-4 py-3 font-medium">Notes</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="border-b last:border-0">
              <td className="px-4 py-3 font-medium">{expense.title}</td>
              <td className="px-4 py-3 capitalize">
                {expense.category.replace("_", " ")}
              </td>
              <td className="px-4 py-3">{formatMoney(expense.amount)}</td>
              <td className="px-4 py-3">{expense.date}</td>
              <td className="px-4 py-3">
                {expense.approvedBy
                  ? userNames.get(expense.approvedBy) ?? expense.approvedBy
                  : "-"}
              </td>
              <td className="px-4 py-3">{expense.notes ?? "-"}</td>
            </tr>
          ))}

          {expenses.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                <div className="font-medium text-zinc-950">
                  No expenses yet.
                </div>
                <div className="mt-1 text-sm">
                  Operating expenses will appear here.
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
