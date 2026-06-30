import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    href: string;
  };
  compact?: boolean;
};

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`text-center ${compact ? "py-6" : "rounded-card border border-dashed border-crm-border bg-[#f6f9fc] px-4 py-10"}`}
    >
      {!compact ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-crm-primary-soft">
          <Icon className="h-5 w-5 text-crm-primary" />
        </div>
      ) : null}
      <h2 className="text-sm font-semibold text-crm-heading">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-crm-muted">
        {description}
      </p>
      {action ? (
        <Button asChild variant="cool" className="mt-4">
          <Link href={action.href}>
            {action.label}
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
