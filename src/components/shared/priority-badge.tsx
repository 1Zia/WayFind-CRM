type Priority = "low" | "medium" | "high" | "urgent";

type PriorityBadgeProps = {
  priority: Priority;
};

const priorityStyles: Record<Priority, string> = {
  low: "bg-crm-border-soft text-crm-muted",
  medium: "bg-crm-primary-soft text-[#0088d9]",
  high: "bg-crm-warning-soft text-[#cc8a00]",
  urgent: "bg-crm-danger-soft text-crm-danger",
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-pill px-2.5 py-0.5 text-xs font-semibold capitalize ${priorityStyles[priority]}`}
    >
      {priority}
    </span>
  );
}
