type MetricCardProps = {
  title: string;
  value: string | number;
  detail?: string;
};

export function MetricCard({ title, value, detail }: MetricCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {detail ? <p className="mt-1 text-xs text-zinc-500">{detail}</p> : null}
    </div>
  );
}
