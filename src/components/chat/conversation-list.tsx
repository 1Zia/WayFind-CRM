"use client";

import React, { useMemo } from "react";
import { ConversationItem } from "./conversation-item";
import { Inbox } from "lucide-react";

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

type ConversationListProps = {
  conversations: Conversation[];
  selectedId: string | null;
  currentUserId: string;
  searchTerm: string;
  onSelectConversation: (id: string) => void;
};

export function ConversationList({
  conversations,
  selectedId,
  currentUserId,
  searchTerm,
  onSelectConversation,
}: ConversationListProps) {
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const otherParticipant =
        c.type === "direct"
          ? c.participants.find((p) => p.userId !== currentUserId)
          : null;
      const name = otherParticipant ? otherParticipant.name : c.name || "";
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [conversations, searchTerm, currentUserId]);

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-xl bg-crm-primary-soft p-3 text-crm-primary">
          <Inbox className="h-6 w-6" />
        </div>
        <h4 className="mt-4 text-sm font-bold text-crm-heading">No Chats Yet</h4>
        <p className="mt-1 text-xs text-crm-muted max-w-[200px]">
          Start a direct chat or create a group to communicate with your team.
        </p>
      </div>
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-crm-muted">
        No conversations match your search.
      </div>
    );
  }

  return (
    <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
      {filteredConversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isSelected={conv.id === selectedId}
          currentUserId={currentUserId}
          onSelect={() => onSelectConversation(conv.id)}
        />
      ))}
    </div>
  );
}
