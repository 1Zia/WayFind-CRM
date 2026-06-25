import { getDashboardStats } from "@/lib/actions/dashboard";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Overview of your company operations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Total Clients" value={stats.totalClients} />
        <StatCard title="Total Leads" value={stats.totalLeads} />
        <StatCard title="Active Projects" value={stats.activeProjects} />
        <StatCard title="Pending Tasks" value={stats.pendingTasks} />
        <StatCard title="Revenue" value={formatMoney(stats.revenue)} />
        <StatCard title="Expenses" value={formatMoney(stats.expenses)} />
      </div>
    </>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
