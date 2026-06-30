import type { ReactNode } from "react";

type FormCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function FormCard({
  title,
  description,
  children,
  className = "",
}: FormCardProps) {
  return (
    <div className={`crm-card max-w-2xl p-6 ${className}`.trim()}>
      {title ? (
        <div className="mb-6 border-b border-crm-border-soft pb-4">
          <h2 className="text-lg font-semibold text-crm-heading">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-crm-muted">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
