"use client";

import React, { useState, useMemo } from "react";
import { X, Search, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createGroupConversation } from "@/lib/actions/chat";

type ActiveUser = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: string;
};

type ProjectOption = {
  id: string;
  name: string;
};

type TaskOption = {
  id: string;
  title: string;
};

type GroupChatDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  usersList: ActiveUser[];
  projectsList: ProjectOption[];
  tasksList: TaskOption[];
  onConversationCreated: (conversationId: string) => void;
};

export function GroupChatDialog({
  isOpen,
  onClose,
  usersList,
  projectsList,
  tasksList,
  onConversationCreated,
}: GroupChatDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredUsers = useMemo(() => {
    return usersList.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [usersList, search]);

  if (!isOpen) return null;

  function toggleUserSelection(userId: string) {
    setSelectedUserIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }

    setLoading(true);
    try {
      const result = await createGroupConversation({
        name,
        description,
        participantIds: selectedUserIds,
        projectId: projectId || undefined,
        taskId: taskId || undefined,
      });

      if (result.success && result.conversationId) {
        toast.success(`Group "${name}" created!`);
        onConversationCreated(result.conversationId);
        onClose();
        // Reset form
        setName("");
        setDescription("");
        setSelectedUserIds([]);
        setProjectId("");
        setTaskId("");
      } else {
        toast.error("Failed to create group");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-crm-heading/40 backdrop-blur-sm animate-in fade-in duration-200">
      <form
        onSubmit={handleCreateGroup}
        className="relative w-full max-w-lg overflow-hidden rounded-card-lg border border-crm-border bg-crm-surface p-6 shadow-dropdown animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-crm-heading">Create Group Chat</h3>
            <p className="text-xs text-crm-muted">Configure group settings and participants</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-crm-muted hover:bg-crm-body hover:text-crm-heading transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Group Name & Desc */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-crm-muted mb-1">
                Group Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Frontend Sync, Marketing Pitch"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-crm-border bg-crm-body py-2 px-3 text-sm text-crm-heading outline-none focus:border-crm-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-crm-muted mb-1">
                Description (Optional)
              </label>
              <textarea
                placeholder="Brief purpose of the group chat..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-crm-border bg-crm-body py-2 px-3 text-sm text-crm-heading outline-none focus:border-crm-primary/50 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Project / Task Links (Optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-crm-muted mb-1">
                Link to Project
              </label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  if (e.target.value) setTaskId(""); // Mutually exclusive link for clarity
                }}
                className="w-full rounded-lg border border-crm-border bg-crm-body py-2 px-2 text-sm text-crm-heading outline-none focus:border-crm-primary/50 transition-colors"
              >
                <option value="">None</option>
                {projectsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-crm-muted mb-1">
                Link to Task
              </label>
              <select
                value={taskId}
                onChange={(e) => {
                  setTaskId(e.target.value);
                  if (e.target.value) setProjectId(""); // Mutually exclusive link for clarity
                }}
                className="w-full rounded-lg border border-crm-border bg-crm-body py-2 px-2 text-sm text-crm-heading outline-none focus:border-crm-primary/50 transition-colors"
              >
                <option value="">None</option>
                {tasksList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-crm-muted">
                Select Participants ({selectedUserIds.length} selected)
              </label>
            </div>
            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-crm-muted" />
              <input
                type="text"
                placeholder="Search teammates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-crm-border bg-crm-body py-1.5 pl-8 pr-3 text-xs text-crm-heading outline-none focus:border-crm-primary/50 transition-colors"
              />
            </div>
            {/* Select User List */}
            <div className="max-h-[160px] overflow-y-auto border border-crm-border-soft rounded-lg divide-y divide-crm-border-soft">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((userItem) => {
                  const isSelected = selectedUserIds.includes(userItem.id);
                  return (
                    <button
                      key={userItem.id}
                      type="button"
                      onClick={() => toggleUserSelection(userItem.id)}
                      className={`flex w-full items-center justify-between p-2 text-left transition-all ${
                        isSelected ? "bg-crm-primary-soft/30" : "hover:bg-crm-body"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {userItem.imageUrl ? (
                          <img
                            src={userItem.imageUrl}
                            alt={userItem.name}
                            className="h-8 w-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-crm-secondary-soft text-crm-secondary text-xs font-bold shrink-0">
                            {userItem.name.charAt(0)}
                          </div>
                        )}
                        <span className="truncate text-xs font-medium text-crm-heading">
                          {userItem.name}
                        </span>
                      </div>
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-md border ${
                          isSelected
                            ? "liquid-glass-active border-white/70 text-slate-900"
                            : "border-crm-border"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-crm-muted">
                  No teammates found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-crm-border-soft pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-crm-muted hover:bg-crm-body transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="liquid-glass-primary flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-900 hover:shadow-theme-md disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Group"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
