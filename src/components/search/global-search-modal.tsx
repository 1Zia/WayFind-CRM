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
        const results = await globalSearch(trimmedQuery, activeTab);
        setResponse(results);
        rememberSearch(trimmedQuery);
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [activeTab, open, query]);

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

  if (!open) {
    return null;
  }

  const isSearching = query.trim().length >= 2;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
      className="fixed inset-0 z-[80] bg-white text-zinc-950"
    >
      <button
        type="button"
        aria-label="Close search"
        onClick={handleClose}
        className="absolute right-6 top-5 rounded-full p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex h-full flex-col">
        <div className="px-7 pt-8">
          <div className="flex items-center gap-3 border-b border-zinc-300 pb-3 pr-14">
            <Search className="h-7 w-7 text-zinc-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleResultShortcut();
                }
              }}
              placeholder="Search Everything ..."
              className="w-full border-0 bg-transparent text-4xl font-medium text-zinc-700 outline-none placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 px-7 py-5">
          <SearchTabs
            activeTab={activeTab}
            tabs={tabs}
            onChange={(tab) => {
              setActiveTab(tab);
              setResponse({ groups: [], total: 0 });
            }}
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDateFilters((current) => !current)}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              <Calendar className="h-4 w-4" />
              {dateFilter === "Anytime" ? "Filter by date" : dateFilter}
            </button>

            {showDateFilters ? (
              <div className="absolute right-0 top-full z-[90] mt-2 w-40 overflow-hidden rounded-lg border bg-white shadow-lg">
                {dateFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => {
                      setDateFilter(filter);
                      setShowDateFilters(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-7 pb-8">
          {!isSearching ? (
            <SearchEmptyState
              recentSearches={recentSearches}
              onPickRecent={setQuery}
              onFocusSearch={() => inputRef.current?.focus()}
              onClose={handleClose}
            />
          ) : (
            <div className="mx-auto max-w-5xl">
              <div className="mb-4 flex items-center justify-between text-sm text-zinc-500">
                <span>
                  {isPending
                    ? "Searching..."
                    : `${response.total} result${
                        response.total === 1 ? "" : "s"
                      } found`}
                </span>
                <span className="hidden rounded-md border px-2 py-1 text-xs text-zinc-500 sm:inline-flex">
                  Press Enter to open first result
                </span>
              </div>

              {isPending ? (
                <div className="flex items-center justify-center py-16 text-sm text-zinc-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching WayFind
                </div>
              ) : response.groups.length > 0 ? (
                <div className="space-y-7">
                  {response.groups.map((group) => (
                    <section key={group.label}>
                      <h2 className="mb-2 text-sm font-semibold text-zinc-500">
                        {group.label}
                      </h2>
                      <div className="rounded-xl border bg-white p-2">
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
                <div className="rounded-xl border border-dashed p-10 text-center">
                  <h2 className="text-base font-semibold text-zinc-950">
                    No results found
                  </h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    Try a client name, lead, project, task, document, invoice,
                    or teammate.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
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
    <div className="pt-16">
      <div className="grid gap-10 lg:grid-cols-4">
        <section>
          <div className="mb-7 flex items-center gap-2 text-lg font-medium text-zinc-800">
            <User className="h-5 w-5 text-orange-400" />
            Related to me
          </div>
          <div className="space-y-5 text-sm text-zinc-600">
            <QuickLink
              href="/tasks"
              icon={<CheckSquare className="h-4 w-4" />}
              label="I'm assigned to"
              onClose={onClose}
            />
            <QuickLink
              href="/documents"
              icon={<FileText className="h-4 w-4" />}
              label="My files"
              onClose={onClose}
            />
            <QuickLink
              href="/projects"
              icon={<Briefcase className="h-4 w-4" />}
              label="Project boards"
              onClose={onClose}
            />
            <div className="flex items-center gap-3">
              <AtSign className="h-4 w-4 text-zinc-700" />
              <span>I was mentioned</span>
            </div>
            <div className="flex items-center gap-3">
              <Archive className="h-4 w-4 text-zinc-700" />
              <span>Archived records</span>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-7 flex items-center gap-2 text-lg font-medium text-zinc-800">
            <Star className="h-5 w-5 fill-emerald-500 text-emerald-500" />
            Saved Searches
          </div>
          <p className="max-w-xs text-sm leading-6 text-zinc-500">
            <Lightbulb className="mr-2 inline h-4 w-4" />
            Save searches for quick access. Saved searches will be available in
            a later release.
          </p>
        </section>

        <section>
          <div className="mb-7 flex items-center gap-2 text-lg font-medium text-zinc-800">
            <Clock className="h-5 w-5 text-blue-500" />
            Recent Searches
          </div>
          {recentSearches.length > 0 ? (
            <div className="space-y-3">
              {recentSearches.map((recent) => (
                <button
                  key={recent}
                  type="button"
                  onClick={() => onPickRecent(recent)}
                  className="block text-left text-sm text-zinc-600 hover:text-zinc-950"
                >
                  {recent}
                </button>
              ))}
            </div>
          ) : (
            <p className="max-w-xs text-sm leading-6 text-zinc-500">
              <Lightbulb className="mr-2 inline h-4 w-4" />
              Your recent searches will appear here after you search.
            </p>
          )}
        </section>

        <section>
          <div className="mb-7 flex items-center gap-2 text-lg font-medium text-zinc-800">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Try the new quick search
          </div>
          <p className="max-w-sm text-sm leading-6 text-zinc-600">
            Find records faster with keyboard-friendly search across your CRM
            workspace.
          </p>
          <div className="mt-5 flex items-center gap-4">
            <button
              type="button"
              onClick={onFocusSearch}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white"
            >
              Open quick search
            </button>
            <span className="text-sm text-zinc-500">Ctrl + K</span>
          </div>
          <div className="mt-7 border-t pt-5 text-sm text-zinc-500">
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
