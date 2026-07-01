import { type LucideIcon } from "lucide-react";

import {
  MetricCardMenu,
  type MetricAction,
} from "@/components/shared/metric-card-menu";

type MetricCardProps = {
  title: string;
  value: string | number;
  detail?: string;
  icon?: LucideIcon;
  tone?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  actions?: MetricAction[];
};

const iconTones: Record<
  NonNullable<MetricCardProps["tone"]>,
  { bg: string; text: string }
> = {
  primary: { bg: "bg-gray-100", text: "text-zinc-950" },
  secondary: { bg: "bg-gray-100", text: "text-zinc-950" },
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
  actions = [],
}: MetricCardProps) {
  const colors = iconTones[tone];

  return (
    <div className="crm-card relative flex min-h-[150px] flex-col justify-between overflow-visible p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        {Icon ? (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.bg}`}
          >
            <Icon className={`h-5 w-5 ${colors.text}`} />
          </div>
        ) : null}

        <MetricCardMenu actions={actions} title={title} />
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <h4 className="mt-2 text-3xl font-semibold tracking-tight text-crm-heading">
            {value}
          </h4>
          {detail ? (
            <p className="mt-1 text-xs font-medium text-gray-400">{detail}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
