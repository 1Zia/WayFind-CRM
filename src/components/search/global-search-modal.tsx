"use client";

import {
  Archive,
  AtSign,
  Briefcase,
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  Lightbulb,
  Loader2,
  Search,
  Sparkles,
  Star,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

import {
  globalSearch,
  type GlobalSearchResponse,
  type SearchScope,
} from "@/lib/actions/search";

import { SearchResultItem } from "./search-result-item";
import { type SearchTab, SearchTabs } from "./search-tabs";

type GlobalSearchModalProps = {
  open: boolean;
  tabs: SearchTab[];
  onClose: () => void;
};

const dateFilters = ["Anytime", "Today", "This week", "This month"];
const recentStorageKey = "wayfind:recent-searches";

export function GlobalSearchModal({
  open,
  tabs,
  onClose,
}: GlobalSearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchScope>("all");
  const [dateFilter, setDateFilter] = useState("Anytime");
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [response, setResponse] = useState<GlobalSearchResponse>({
    groups: [],
    total: 0,
  });
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const flatResults = useMemo(
    () => response.groups.flatMap((group) => group.results),
    [response.groups],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    inputRef.current?.focus();
    const stored = window.localStorage.getItem(recentStorageKey);

    try {
      setRecentSearches(stored ? JSON.parse(stored) : []);
    } catch {
      setRecentSearches([]);
      window.localStorage.removeItem(recentStorageKey);
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setResponse({ groups: [], total: 0 });
      return;
    }

    const timeout = window.setTimeout(() => {
      startTransition(async () => {
        const results = await globalSearch(trimmedQuery, activeTab, dateFilter);
        setResponse(results);
        rememberSearch(trimmedQuery);
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [activeTab, open, query, dateFilter]);

  function rememberSearch(value: string) {
    const next = [
      value,
      ...recentSearches.filter(
        (recent) => recent.toLowerCase() !== value.toLowerCase(),
      ),
    ].slice(0, 5);
    setRecentSearches(next);
    window.localStorage.setItem(recentStorageKey, JSON.stringify(next));
  }

  function handleClose() {
    setShowDateFilters(false);
    onClose();
  }

  function handleResultShortcut() {
    const firstResult = flatResults[0];
    if (!firstResult) {
      return;
    }

    handleClose();
    router.push(firstResult.href);
  }

  if (!open || !mounted) {
    return null;
  }

  const isSearching = query.trim().length >= 2;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto p-4 sm:p-10 md:p-20"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/25 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Dialog Card */}
      <div className="pointer-events-auto relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-crm-border bg-white shadow-theme-xl">
        {/* Search Input Area */}
        <div className="flex items-center gap-3 border-b border-crm-border px-6 py-5">
          <Search className="h-6 w-6 shrink-0 text-slate-700" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleResultShortcut();
              }
            }}
            placeholder="Search or type command..."
            className="w-full border-0 bg-transparent text-lg font-medium text-crm-heading outline-none placeholder:text-gray-400"
          />
          <button
            type="button"
            aria-label="Close search"
            onClick={handleClose}
            className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs & Filters */}
        <div className="flex items-center justify-between gap-4 border-b border-crm-border bg-gray-50/80 px-6 py-3">
          <div className="flex-1 min-w-0">
            <SearchTabs
              activeTab={activeTab}
              tabs={tabs}
              onChange={(tab) => {
                setActiveTab(tab);
                setResponse({ groups: [], total: 0 });
              }}
            />
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowDateFilters((current) => !current)}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-crm-border bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 shadow-theme-xs hover:bg-gray-50"
            >
              <Calendar className="h-3.5 w-3.5" />
              {dateFilter === "Anytime" ? "Filter by date" : dateFilter}
            </button>

            {showDateFilters ? (
              <div className="absolute right-0 top-full z-[90] mt-1.5 w-40 overflow-hidden rounded-xl border border-crm-border bg-white shadow-theme-lg">
                {dateFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => {
                      setDateFilter(filter);
                      setShowDateFilters(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Search Results Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          {!isSearching ? (
            <SearchEmptyState
              recentSearches={recentSearches}
              onPickRecent={setQuery}
              onFocusSearch={() => inputRef.current?.focus()}
              onClose={handleClose}
            />
          ) : (
            <div className="w-full">
              <div className="mb-4 flex items-center justify-between text-xs text-gray-400">
                <span>
                  {isPending
                    ? "Searching..."
                    : `${response.total} result${
                        response.total === 1 ? "" : "s"
                    } found`}
                </span>
                <span className="hidden rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-500 sm:inline-flex shadow-theme-xs">
                  Press Enter to open first result
                </span>
              </div>

              {isPending ? (
                <div className="flex items-center justify-center py-16 text-sm text-gray-400">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-700" />
                  Searching WayFind...
                </div>
              ) : response.groups.length > 0 ? (
                <div className="space-y-6">
                  {response.groups.map((group) => (
                    <section key={group.label}>
                      <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        {group.label}
                      </h2>
                      <div className="space-y-1 rounded-xl border border-crm-border bg-white p-1.5 shadow-theme-xs">
                        {group.results.map((result) => (
                          <SearchResultItem
                            key={`${result.type}-${result.id}`}
                            result={result}
                            onSelect={handleClose}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-10 text-center">
                  <h2 className="text-sm font-semibold text-gray-900">
                    No results found
                  </h2>
                  <p className="mt-1 text-xs text-gray-400">
                    Try a client name, lead, project, task, document, invoice,
                    or teammate.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function SearchEmptyState({
  recentSearches,
  onFocusSearch,
  onPickRecent,
  onClose,
}: {
  recentSearches: string[];
  onFocusSearch: () => void;
  onPickRecent: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="pt-2">
      <div className="grid gap-8 lg:grid-cols-4">
        <section>
          <div className="mb-5 flex items-center gap-2 text-base font-semibold text-gray-900">
            <User className="h-4.5 w-4.5 text-orange-400" />
            Related to me
          </div>
          <div className="space-y-3.5 text-sm text-gray-600">
            <QuickLink
              href="/tasks"
              icon={<CheckSquare className="h-4 w-4 text-gray-400" />}
              label="I'm assigned to"
              onClose={onClose}
            />
            <QuickLink
              href="/documents"
              icon={<FileText className="h-4 w-4 text-gray-400" />}
              label="My files"
              onClose={onClose}
            />
            <QuickLink
              href="/projects"
              icon={<Briefcase className="h-4 w-4 text-gray-400" />}
              label="Project boards"
              onClose={onClose}
            />
            <div className="flex items-center gap-3">
              <AtSign className="h-4 w-4 text-gray-400" />
              <span>I was mentioned</span>
            </div>
            <div className="flex items-center gap-3">
              <Archive className="h-4 w-4 text-gray-400" />
              <span>Archived records</span>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-center gap-2 text-base font-semibold text-gray-900">
            <Star className="h-4.5 w-4.5 fill-success-500 text-success-500" />
            Saved Searches
          </div>
          <p className="max-w-xs text-xs leading-5 text-gray-400">
            <Lightbulb className="mr-1.5 inline h-4 w-4 text-amber-500" />
            Save searches for quick access. Saved searches will be available in
            a later release.
          </p>
        </section>

        <section>
          <div className="mb-5 flex items-center gap-2 text-base font-semibold text-gray-900">
            <Clock className="h-4.5 w-4.5 text-brand-500" />
            Recent Searches
          </div>
          {recentSearches.length > 0 ? (
            <div className="space-y-2.5">
              {recentSearches.map((recent) => (
                <button
                  key={recent}
                  type="button"
                  onClick={() => onPickRecent(recent)}
                  className="block text-left text-sm text-gray-600 hover:text-brand-500 font-medium"
                >
                  {recent}
                </button>
              ))}
            </div>
          ) : (
            <p className="max-w-xs text-xs leading-5 text-gray-400">
              <Lightbulb className="mr-1.5 inline h-4 w-4 text-amber-500" />
              Your recent searches will appear here after you search.
            </p>
          )}
        </section>

        <section>
          <div className="mb-5 flex items-center gap-2 text-base font-semibold text-gray-900">
            <Sparkles className="h-4.5 w-4.5 text-purple-500" />
            Quick Search
          </div>
          <p className="max-w-sm text-xs leading-5 text-gray-400">
            Find records faster with keyboard-friendly search across your CRM
            workspace.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onFocusSearch}
              className="liquid-glass-primary rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 hover:shadow-theme-md"
            >
              Open search box
            </button>
            <span className="text-xs text-gray-400 font-medium">Ctrl + K</span>
          </div>
          <div className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-400">
            AI-powered answers are planned for a later release.
          </div>
        </section>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
  onClose,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-3 hover:text-zinc-950"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
