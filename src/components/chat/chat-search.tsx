"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MessageSquare, Loader2, X } from "lucide-react";
import { searchChatMessages } from "@/lib/actions/chat";

type SearchResult = {
  id: string;
  content: string;
  createdAt: Date;
  conversationId: string;
  senderId: string;
  senderName: string | null;
  conversationName: string | null;
  conversationType: "direct" | "group" | "project" | "task";
};

type ChatSearchProps = {
  onSelectConversation: (conversationId: string) => void;
};

export function ChatSearch({ onSelectConversation }: ChatSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const matches = await searchChatMessages(query);
        // Cast results correctly
        setResults(
          matches.map((m) => ({
            ...m,
            createdAt: new Date(m.createdAt),
          })) as SearchResult[]
        );
        setShowResults(true);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle click outside to close results dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-crm-muted" />
        <input
          type="text"
          placeholder="Search messages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
          className="w-full rounded-lg border border-crm-border bg-crm-body py-2 pl-10 pr-10 text-sm text-crm-heading outline-none placeholder:text-crm-muted focus:border-crm-primary/50 transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-crm-muted hover:text-crm-heading"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-[320px] overflow-y-auto rounded-card border border-crm-border bg-crm-surface p-2 shadow-dropdown">
          <div className="flex items-center justify-between px-3 py-1 mb-1 border-b border-crm-border-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-crm-muted">
              Search Results ({results.length})
            </span>
            {loading && <Loader2 className="h-3 w-3 animate-spin text-crm-primary" />}
          </div>

          <div className="space-y-1">
            {results.length > 0 ? (
              results.map((res) => (
                <button
                  key={res.id}
                  onClick={() => {
                    onSelectConversation(res.conversationId);
                    setShowResults(false);
                  }}
                  className="flex w-full flex-col gap-0.5 rounded-lg p-2.5 text-left transition-colors hover:bg-crm-primary-soft/30"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-crm-primary truncate max-w-[70%]">
                      {res.conversationType === "direct"
                        ? `Chat with ${res.senderName}`
                        : `${res.conversationName || "Group Chat"}`}
                    </span>
                    <span className="text-[9px] text-crm-muted">
                      {res.createdAt.toLocaleDateString("en-PK", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-crm-heading font-medium truncate w-full">
                    <span className="text-crm-muted font-normal">{res.senderName}:</span>{" "}
                    {res.content}
                  </p>
                </button>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-crm-muted">
                No message results found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
