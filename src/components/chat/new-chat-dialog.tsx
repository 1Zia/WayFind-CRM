"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { createDirectConversation } from "@/lib/actions/chat";

type ActiveUser = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: string;
  lastSeenAt: Date | null;
};

type NewChatDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  usersList: ActiveUser[];
  onConversationCreated: (conversationId: string) => void;
};

export function NewChatDialog({
  isOpen,
  onClose,
  usersList,
  onConversationCreated,
}: NewChatDialogProps) {
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return usersList.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [usersList, search]);

  if (!isOpen) return null;

  async function handleStartChat(targetUserId: string) {
    setLoadingId(targetUserId);
    try {
      const result = await createDirectConversation(targetUserId);
      if (result.success && result.conversationId) {
        toast.success("Direct chat started!");
        onConversationCreated(result.conversationId);
        onClose();
      } else {
        toast.error("Failed to start chat.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-crm-heading/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-card-lg border border-crm-border bg-crm-surface p-6 shadow-dropdown animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-crm-heading">New Direct Chat</h3>
            <p className="text-xs text-crm-muted">Select a teammate to start chatting</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-crm-muted hover:bg-crm-body hover:text-crm-heading transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-crm-muted" />
          <input
            type="text"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-crm-border bg-crm-body py-2 pl-10 pr-4 text-sm text-crm-heading outline-none placeholder:text-crm-muted focus:border-crm-primary/50 transition-colors"
          />
        </div>

        {/* User List */}
        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((userItem) => (
              <button
                key={userItem.id}
                onClick={() => handleStartChat(userItem.id)}
                disabled={loadingId !== null}
                className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-all hover:bg-crm-primary-soft/40 disabled:opacity-50"
              >
                <div className="relative h-10 w-10 shrink-0">
                  {userItem.imageUrl ? (
                    <img
                      src={userItem.imageUrl}
                      alt={userItem.name}
                      className="h-10 w-10 rounded-full object-cover border border-crm-border-soft"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-crm-secondary-soft text-crm-secondary font-semibold">
                      {userItem.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-crm-heading">
                    {userItem.name}
                  </p>
                  <p className="truncate text-xs capitalize text-crm-muted">
                    {userItem.role.replace("_", " ")}
                  </p>
                </div>
                <div>
                  {loadingId === userItem.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-crm-primary" />
                  ) : (
                    <span className="text-xs text-crm-primary font-medium hover:underline">Chat</span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-crm-muted">
              No team members found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
