type TaskTypeBadgeProps = {
  type: "feature" | "bug" | "improvement" | "research" | "testing" | "other";
};

const typeStyles = {
  feature: "bg-emerald-50 text-emerald-700",
  bug: "bg-red-50 text-red-700",
  improvement: "bg-blue-50 text-blue-700",
  research: "bg-violet-50 text-violet-700",
  testing: "bg-pink-50 text-pink-700",
  other: "bg-zinc-100 text-zinc-700",
};

export function TaskTypeBadge({ type }: TaskTypeBadgeProps) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${typeStyles[type]}`}
    >
      {type}
    </span>
  );
}
