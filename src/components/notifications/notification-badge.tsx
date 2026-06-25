type NotificationBadgeProps = {
  type:
    | "task_assigned"
    | "project_deadline"
    | "payment_received"
    | "approval_required"
    | "system";
};

const typeLabels: Record<NotificationBadgeProps["type"], string> = {
  task_assigned: "Task Assigned",
  project_deadline: "Project Deadline",
  payment_received: "Payment Received",
  approval_required: "Approval Required",
  system: "System",
};

export function NotificationBadge({ type }: NotificationBadgeProps) {
  return (
    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
      {typeLabels[type]}
    </span>
  );
}
