"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MoreVertical } from "lucide-react";

export type MetricAction = {
  href: string;
  label: string;
};

type MetricCardMenuProps = {
  actions: MetricAction[];
  title: string;
};

export function MetricCardMenu({ actions, title }: MetricCardMenuProps) {
  const [open, setOpen] = useState(false);

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`${title} options`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="liquid-glass flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:text-slate-950"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-xl border border-white/70 bg-white/80 p-1 shadow-theme-lg backdrop-blur-xl">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-white/70 hover:text-slate-950"
            >
              <span>{action.label}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
