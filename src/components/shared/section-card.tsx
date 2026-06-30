import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function SectionCard({
  title,
  description,
  children,
  action,
  className = "",
}: SectionCardProps) {
  return (
    <section className={`crm-card overflow-hidden ${className}`.trim()}>
      <div className="flex items-start justify-between gap-4 border-b border-crm-border px-6 py-5">
        <div>
          <h2 className="text-base font-bold text-crm-heading">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs font-medium text-gray-400">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}
