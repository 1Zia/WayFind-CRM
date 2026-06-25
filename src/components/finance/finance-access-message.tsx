export function FinanceAccessMessage() {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Finance access required
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-500">
        Only super admins and finance managers can access finance records.
      </p>
    </div>
  );
}
