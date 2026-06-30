import type { ReactNode } from "react";

type DataTableWrapperProps = {
  children: ReactNode;
  className?: string;
};

export function DataTableWrapper({
  children,
  className = "",
}: DataTableWrapperProps) {
  return (
    <div className={`crm-card overflow-hidden ${className}`.trim()}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

type DataTableProps = {
  children: ReactNode;
  className?: string;
};

export function DataTable({ children, className = "" }: DataTableProps) {
  return (
    <table className={`w-full min-w-[640px] text-sm ${className}`.trim()}>
      {children}
    </table>
  );
}

export function DataTableHead({ children }: { children: ReactNode }) {
  return <thead className="crm-table-head">{children}</thead>;
}

export function DataTableHeadCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th className={`crm-table-cell font-semibold ${className}`.trim()}>
      {children}
    </th>
  );
}

export function DataTableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function DataTableRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr className={`crm-table-row ${className}`.trim()}>{children}</tr>
  );
}

export function DataTableCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={`crm-table-cell ${className}`.trim()}>{children}</td>
  );
}

export function DataTableEmptyRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="crm-table-cell py-12 text-center">
        {children}
      </td>
    </tr>
  );
}
