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
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0">
      {tabs.map((tab) => {
        const active = tab.value === activeTab;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={
              active
                ? "liquid-glass-active shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-brand-600"
                : "shrink-0 rounded-xl px-4 py-2 text-sm font-medium text-crm-muted transition-colors hover:bg-white/50 hover:text-crm-heading"
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
