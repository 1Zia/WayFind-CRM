"use client";

import React, { useState } from "react";
import { MessageSquarePlus, Users, Search, Filter } from "lucide-react";
import { ChatSearch } from "./chat-search";
import { ConversationList } from "./conversation-list";

type Participant = {
  id: string;
  userId: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: "owner" | "admin" | "member";
  lastSeenAt: Date | null;
};

type Message = {
  id: string;
  content: string;
  type: "text" | "file" | "system";
  createdAt: Date;
  senderId: string;
  senderName: string | null;
};

type Conversation = {
  id: string;
  type: "direct" | "group" | "project" | "task";
  name: string | null;
  description: string | null;
  projectId: string | null;
  taskId: string | null;
  lastMessageAt: Date | null;
  isArchived: boolean;
  pinned: boolean;
  muted: boolean;
  participants: Participant[];
  lastMessage: Message | null;
  unreadCount: number;
};

type ChatSidebarProps = {
  conversations: Conversation[];
  selectedId: string | null;
  currentUserId: string;
  currentUserRole: string;
  onSelectConversation: (id: string) => void;
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
};

export function ChatSidebar({
  conversations,
  selectedId,
  currentUserId,
  currentUserRole,
  onSelectConversation,
  onOpenNewChat,
  onOpenNewGroup,
}: ChatSidebarProps) {
  const [localSearch, setLocalSearch] = useState("");

  const canCreateGroup = currentUserRole === "super_admin" || currentUserRole === "project_manager";

  return (
    <div className="flex h-full w-full flex-col border-r border-crm-border bg-crm-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-crm-border-soft">
        <h2 className="text-lg font-bold text-crm-heading flex items-center gap-2">
          Messages
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenNewChat}
            className="rounded-full p-2 text-crm-primary hover:bg-crm-primary-soft/50 transition-colors"
            title="New Direct Chat"
          >
            <MessageSquarePlus className="h-5 w-5" />
          </button>
          {canCreateGroup && (
            <button
              onClick={onOpenNewGroup}
              className="rounded-full p-2 text-crm-secondary hover:bg-crm-secondary-soft/50 transition-colors"
              title="Create Group Chat"
            >
              <Users className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Global Message Search */}
      <div className="px-4 py-2 border-b border-crm-border-soft">
        <ChatSearch onSelectConversation={onSelectConversation} />
      </div>

      {/* Local Conversation Filter */}
      <div className="px-4 py-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Filter className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-crm-muted" />
          <input
            type="text"
            placeholder="Filter conversations..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full rounded-lg border border-crm-border bg-crm-body py-1.5 pl-8 pr-3 text-xs text-crm-heading outline-none placeholder:text-crm-muted focus:border-crm-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          currentUserId={currentUserId}
          searchTerm={localSearch}
          onSelectConversation={onSelectConversation}
        />
      </div>
    </div>
  );
}
