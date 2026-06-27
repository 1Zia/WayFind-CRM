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
        className="flex h-10 w-full max-w-xl items-center justify-between rounded-lg border bg-white px-3 text-left text-sm text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Search everything...</span>
        </span>
        <span className="hidden rounded border bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-500 sm:inline">
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
