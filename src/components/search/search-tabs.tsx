"use client";

import type { SearchScope } from "@/lib/actions/search";

export type SearchTab = {
  value: SearchScope;
  label: string;
};

type SearchTabsProps = {
  activeTab: SearchScope;
  tabs: SearchTab[];
  onChange: (tab: SearchScope) => void;
};

export function SearchTabs({ activeTab, tabs, onChange }: SearchTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {tabs.map((tab) => {
        const active = tab.value === activeTab;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={
              active
                ? "rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-zinc-900"
                : "rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
