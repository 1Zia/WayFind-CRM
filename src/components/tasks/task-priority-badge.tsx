import { PriorityBadge } from "@/components/shared/priority-badge";

type TaskPriorityBadgeProps = {
  priority: "low" | "medium" | "high" | "urgent";
};

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  return <PriorityBadge priority={priority} />;
}
