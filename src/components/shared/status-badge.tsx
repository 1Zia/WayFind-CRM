type StatusBadgeProps = {
  children: string;
  tone?: "default" | "success" | "warning" | "danger" | "info" | "primary" | "secondary";
};

const tones: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-error-50 text-error-600",
  info: "bg-blue-light-50 text-blue-light-500",
  primary: "bg-brand-50 text-brand-500",
  secondary: "bg-brand-50 text-brand-500",
};

export function StatusBadge({ children, tone = "default" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-pill px-2.5 py-0.5 text-xs font-semibold capitalize ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
