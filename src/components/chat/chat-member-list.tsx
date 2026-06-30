"use client";

import React, { useState, useMemo } from "react";
import { X, UserMinus, UserPlus, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { addParticipants, removeParticipant } from "@/lib/actions/chat";

type Participant = {
  id: string;
  userId: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: "owner" | "admin" | "member";
  roleInSystem: string;
};

type ActiveUser = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: string;
};

type ChatMemberListProps = {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  conversationName: string;
  participants: Participant[];
  currentUserRole: "owner" | "admin" | "member";
  currentUserSystemRole: string;
  allUsersList: ActiveUser[];
  onRefresh: () => void;
};

export function ChatMemberList({
  isOpen,
  onClose,
  conversationId,
  conversationName,
  participants,
  currentUserRole,
  currentUserSystemRole,
  allUsersList,
  onRefresh,
}: ChatMemberListProps) {
  const [adding, setAdding] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const isGroupAdmin =
    currentUserRole === "owner" ||
    currentUserRole === "admin" ||
    currentUserSystemRole === "super_admin";

  const memberUserIds = useMemo(() => new Set(participants.map((p) => p.userId)), [participants]);

  const addableUsers = useMemo(() => {
    return allUsersList.filter(
      (u) =>
        !memberUserIds.has(u.id) &&
        (u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()))
    );
  }, [allUsersList, memberUserIds, search]);

  if (!isOpen) return null;

  async function handleRemoveUser(userId: string, userName: string) {
    if (!confirm(`Are you sure you want to remove ${userName} from the group?`)) return;

    setLoadingId(userId);
    try {
      const result = await removeParticipant(conversationId, userId);
      if (result.success) {
        toast.success(`${userName} removed from group.`);
        onRefresh();
      } else {
        toast.error("Failed to remove user.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleAddUser(userId: string, userName: string) {
    setLoadingId(userId);
    try {
      const result = await addParticipants(conversationId, [userId]);
      if (result.success) {
        toast.success(`${userName} added to group!`);
        onRefresh();
      } else {
        toast.error("Failed to add user.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-crm-heading/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-card-lg border border-crm-border bg-crm-surface p-6 shadow-dropdown animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-crm-heading">{conversationName} Members</h3>
            <p className="text-xs text-crm-muted">{participants.length} teammates in this chat</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-crm-muted hover:bg-crm-body hover:text-crm-heading transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Toggle if Admin */}
        {isGroupAdmin && (
          <div className="mb-4 flex border-b border-crm-border-soft">
            <button
              onClick={() => setAdding(false)}
              className={`flex-1 pb-2 text-sm font-semibold transition-colors ${
                !adding
                  ? "border-b-2 border-crm-primary text-crm-primary"
                  : "text-crm-muted hover:text-crm-heading"
              }`}
            >
              Current Members
            </button>
            <button
              onClick={() => setAdding(true)}
              className={`flex-1 pb-2 text-sm font-semibold transition-colors ${
                adding
                  ? "border-b-2 border-crm-primary text-crm-primary"
                  : "text-crm-muted hover:text-crm-heading"
              }`}
            >
              Add Members
            </button>
          </div>
        )}

        {/* Search */}
        {adding && (
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-crm-border bg-crm-body py-1.5 px-3 text-xs text-crm-heading outline-none focus:border-crm-primary/50 transition-colors"
            />
          </div>
        )}

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {!adding ? (
            /* Current Members List */
            participants.map((part) => (
              <div
                key={part.id}
                className="flex items-center justify-between rounded-lg p-2 hover:bg-crm-body transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {part.imageUrl ? (
                    <img
                      src={part.imageUrl}
                      alt={part.name}
                      className="h-9 w-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-crm-secondary-soft text-crm-secondary text-sm font-bold shrink-0">
                      {part.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-crm-heading flex items-center gap-1">
                      {part.name}
                      {part.role === "owner" && (
                        <span title="Group Owner">
                          <Shield className="h-3 w-3 text-crm-warning fill-crm-warning" />
                        </span>
                      )}
                      {part.role === "admin" && (
                        <span title="Group Admin">
                          <Shield className="h-3 w-3 text-crm-primary fill-crm-primary" />
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs capitalize text-crm-muted">
                      {part.roleInSystem.replace("_", " ")}
                    </p>
                  </div>
                </div>

                {/* Remove button if permitted */}
                {isGroupAdmin && part.role !== "owner" && (
                  <button
                    disabled={loadingId !== null}
                    onClick={() => handleRemoveUser(part.userId, part.name)}
                    className="rounded-lg p-1.5 text-crm-danger hover:bg-crm-danger-soft transition-colors disabled:opacity-50"
                    title="Remove user"
                  >
                    {loadingId === part.userId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserMinus className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            ))
          ) : (
            /* Addable Members List */
            addableUsers.length > 0 ? (
              addableUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-lg p-2 hover:bg-crm-body transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {u.imageUrl ? (
                      <img
                        src={u.imageUrl}
                        alt={u.name}
                        className="h-9 w-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-crm-secondary-soft text-crm-secondary text-sm font-bold shrink-0">
                        {u.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-crm-heading">{u.name}</p>
                      <p className="truncate text-xs capitalize text-crm-muted">
                        {u.role.replace("_", " ")}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={loadingId !== null}
                    onClick={() => handleAddUser(u.id, u.name)}
                    className="rounded-lg p-1.5 text-crm-success hover:bg-crm-success-soft transition-colors disabled:opacity-50"
                    title="Add user"
                  >
                    {loadingId === u.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-crm-muted">
                No addable users found.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
