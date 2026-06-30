"use client";

import {
  Briefcase,
  CheckSquare,
  CircleDollarSign,
  FileText,
  Users,
  MessageSquare,
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
  chat: MessageSquare,
};

export function SearchResultItem({ result, onSelect }: SearchResultItemProps) {
  const Icon = resultIcons[result.type];

  return (
    <Link
      href={result.href}
      onClick={onSelect}
      className="flex items-start gap-3 rounded-lg border border-transparent px-3 py-2.5 hover:border-gray-100 hover:bg-gray-50/70 transition-all"
    >
      <span className="mt-0.5 rounded-lg border border-gray-100 bg-white p-2 text-gray-500 shadow-theme-xs">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-gray-900">
            {result.title}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold capitalize text-gray-600">
            {result.badge}
          </span>
          {result.status ? (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold capitalize text-brand-600">
              {result.status}
            </span>
          ) : null}
        </span>
        {result.subtitle ? (
          <span className="mt-0.5 block line-clamp-1 text-xs text-gray-400">
            {result.subtitle}
          </span>
        ) : null}
        {result.metadata ? (
          <span className="mt-0.5 block text-[10px] font-medium text-gray-400">
            {result.metadata}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
