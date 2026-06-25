type StatusBadgeProps = {
  children: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
};

const tones: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  default: "bg-zinc-100 text-zinc-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-purple-50 text-purple-700",
};

export function StatusBadge({ children, tone = "default" }: StatusBadgeProps) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
