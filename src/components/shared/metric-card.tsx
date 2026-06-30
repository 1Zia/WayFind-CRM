import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string | number;
  detail?: string;
  icon?: LucideIcon;
  tone?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
};

const iconTones: Record<
  NonNullable<MetricCardProps["tone"]>,
  { bg: string; text: string }
> = {
  primary: { bg: "bg-brand-50", text: "text-brand-500" },
  secondary: { bg: "bg-brand-50", text: "text-brand-500" },
  success: { bg: "bg-success-50", text: "text-success-600" },
  warning: { bg: "bg-warning-50", text: "text-warning-600" },
  danger: { bg: "bg-error-50", text: "text-error-600" },
  info: { bg: "bg-blue-light-50", text: "text-blue-light-500" },
};

export function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "primary",
}: MetricCardProps) {
  const colors = iconTones[tone];

  return (
    <div className="crm-card p-5 md:p-6 flex flex-col justify-between">
      {Icon ? (
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg}`}
        >
          <Icon className={`h-6 w-6 ${colors.text}`} />
        </div>
      ) : null}
      <div className="mt-5 flex items-end justify-between">
        <div>
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <h4 className="mt-1.5 text-2xl font-bold tracking-tight text-crm-heading">
            {value}
          </h4>
          {detail ? (
            <p className="mt-1 text-xs text-gray-400 font-medium">{detail}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
