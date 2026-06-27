"use client";

import {
  Briefcase,
  CheckSquare,
  CircleDollarSign,
  FileText,
  Users,
} from "lucide-react";
import Link from "next/link";

import type { SearchResult } from "@/lib/actions/search";

type SearchResultItemProps = {
  result: SearchResult;
  onSelect: () => void;
};

const resultIcons = {
  client: Users,
  lead: Users,
  project: Briefcase,
  task: CheckSquare,
  document: FileText,
  finance: CircleDollarSign,
  person: Users,
};

export function SearchResultItem({ result, onSelect }: SearchResultItemProps) {
  const Icon = resultIcons[result.type];

  return (
    <Link
      href={result.href}
      onClick={onSelect}
      className="flex items-start gap-3 rounded-lg border border-transparent px-3 py-3 hover:border-zinc-200 hover:bg-zinc-50"
    >
      <span className="mt-0.5 rounded-lg border bg-white p-2 text-zinc-600">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-zinc-950">
            {result.title}
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium capitalize text-zinc-700">
            {result.badge}
          </span>
          {result.status ? (
            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium capitalize text-purple-700">
              {result.status}
            </span>
          ) : null}
        </span>
        {result.subtitle ? (
          <span className="mt-1 block line-clamp-2 text-sm text-zinc-600">
            {result.subtitle}
          </span>
        ) : null}
        {result.metadata ? (
          <span className="mt-1 block text-xs text-zinc-500">
            {result.metadata}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
