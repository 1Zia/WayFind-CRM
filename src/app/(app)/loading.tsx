export default function AppLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-48 rounded bg-zinc-200" />
        <div className="mt-2 h-4 w-80 rounded bg-zinc-100" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-white p-5">
            <div className="h-4 w-24 rounded bg-zinc-100" />
            <div className="mt-3 h-8 w-20 rounded bg-zinc-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
