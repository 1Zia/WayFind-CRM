type ForbiddenStateProps = {
  title?: string;
  description?: string;
};

export function ForbiddenState({
  title = "Access denied",
  description = "You do not have permission to view this page.",
}: ForbiddenStateProps) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </div>
  );
}
