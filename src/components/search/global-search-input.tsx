"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { GlobalSearchModal } from "@/components/search/global-search-modal";
import type { SearchTab } from "@/components/search/search-tabs";

type GlobalSearchInputProps = {
  tabs: SearchTab[];
};

export function GlobalSearchInput({ tabs }: GlobalSearchInputProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        return;
      }

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="liquid-glass relative flex h-12 w-full max-w-[430px] cursor-text items-center justify-between rounded-2xl px-4 text-left text-sm text-gray-400 hover:shadow-theme-md"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <Search className="h-4.5 w-4.5 shrink-0 text-gray-400" />
          <span className="truncate text-gray-400">Search anything...</span>
        </span>
        <span className="hidden rounded-lg border border-white/70 bg-white/55 px-2 py-0.5 text-[10px] font-semibold text-gray-500 shadow-theme-xs backdrop-blur-xl sm:inline">
          Ctrl K
        </span>
      </button>

      <GlobalSearchModal
        open={open}
        tabs={tabs}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
