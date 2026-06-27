type TaskPriorityBadgeProps = {
  priority: "low" | "medium" | "high" | "urgent";
};

const priorityStyles = {
  low: "bg-zinc-100 text-zinc-700",
  medium: "bg-blue-50 text-blue-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-red-50 text-red-700",
};

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${priorityStyles[priority]}`}
    >
      {priority}
    </span>
  );
}
