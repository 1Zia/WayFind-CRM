type StatusBadgeProps = {
  children: string;
  tone?: "default" | "success" | "warning" | "danger" | "info" | "primary" | "secondary";
};

const tones: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-success-50 text-success-700",
  warning: "bg-orange-50 text-orange-700",
  danger: "bg-error-50 text-error-700",
  info: "bg-gray-100 text-gray-700",
  primary: "liquid-glass-active text-slate-900",
  secondary: "bg-success-50 text-success-700",
};

export function StatusBadge({ children, tone = "default" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-pill px-3 py-1 text-xs font-semibold capitalize ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
