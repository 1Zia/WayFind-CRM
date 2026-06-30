import type { ReactNode } from "react";

type ActionToolbarProps = {
  children: ReactNode;
  className?: string;
};

export function ActionToolbar({
  children,
  className = "",
}: ActionToolbarProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-card border border-crm-border-soft bg-crm-surface px-4 py-3 shadow-card ${className}`.trim()}
    >
      {children}
    </div>
  );
}
