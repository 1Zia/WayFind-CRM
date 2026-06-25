import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border bg-white px-4 py-10 text-center">
      <h2 className="text-sm font-semibold text-zinc-950">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
        {description}
      </p>
      {action ? (
        <Link
          href={action.href}
          className="mt-4 inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
