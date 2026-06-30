"use client";

import React from "react";
import { Pin, BellOff, Folder, CheckSquare, MessageSquare } from "lucide-react";
import { getPresenceStatus } from "@/lib/presence";

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

type ConversationItemProps = {
  conversation: Conversation;
  isSelected: boolean;
  currentUserId: string;
  onSelect: () => void;
};

export function ConversationItem({
  conversation,
  isSelected,
  currentUserId,
  onSelect,
}: ConversationItemProps) {
  // Find other participant for direct chats
  const otherParticipant =
    conversation.type === "direct"
      ? conversation.participants.find((p) => p.userId !== currentUserId)
      : null;

  // Deriving name and image
  const name = otherParticipant ? otherParticipant.name : conversation.name || "Unnamed Group";
  const imageUrl = otherParticipant ? otherParticipant.imageUrl : null;
  const initial = name.charAt(0).toUpperCase();

  // Presence status for direct chats
  const presence = otherParticipant
    ? getPresenceStatus(otherParticipant.lastSeenAt)
    : null;

  // Format last message time
  const timeString = useMemoTime(conversation.lastMessageAt || conversation.lastMessage?.createdAt);

  // Message preview text
  const messagePreview = (() => {
    if (!conversation.lastMessage) return "No messages yet";
    const msg = conversation.lastMessage;
    const sender = msg.senderId === currentUserId ? "You" : msg.senderName || "Teammate";
    if (msg.type === "file") return `${sender} sent an attachment`;
    return `${sender}: ${msg.content}`;
  })();

  return (
    <button
      onClick={onSelect}
      className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 ${
        isSelected
          ? "bg-crm-primary-soft text-crm-primary shadow-sm"
          : "text-crm-heading hover:bg-[#f6f9fc] hover:shadow-sm"
      }`}
    >
      {/* Avatar Container */}
      <div className="relative h-11 w-11 shrink-0">
        {conversation.type === "direct" ? (
          <>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="h-11 w-11 rounded-full object-cover border border-crm-border-soft"
              />
            ) : (
              <div className={`flex h-11 w-11 items-center justify-center rounded-full text-base font-bold ${
                isSelected ? "bg-crm-primary text-white" : "bg-crm-primary-soft text-crm-primary"
              }`}>
                {initial}
              </div>
            )}
            {/* Presence indicator */}
            {presence && (
              <span
                className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-crm-surface ${
                  presence === "online"
                    ? "bg-crm-success"
                    : presence === "away"
                    ? "bg-crm-warning"
                    : "bg-crm-muted"
                }`}
              />
            )}
          </>
        ) : (
          /* Group avatar styles depending on linkage */
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-base font-bold border border-crm-border-soft ${
            isSelected
              ? "bg-crm-primary text-white"
              : "bg-crm-secondary-soft text-crm-secondary"
          }`}>
            {conversation.projectId ? (
              <Folder className="h-5 w-5" />
            ) : conversation.taskId ? (
              <CheckSquare className="h-5 w-5" />
            ) : (
              <MessageSquare className="h-5 w-5" />
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`truncate text-sm font-semibold ${
            isSelected ? "text-crm-primary" : "text-crm-heading"
          }`}>
            {name}
          </span>
          <span className="text-[10px] text-crm-muted shrink-0 ml-1">
            {timeString}
          </span>
        </div>

        <p className={`truncate text-xs ${
          conversation.unreadCount > 0 && !isSelected
            ? "text-crm-heading font-semibold"
            : "text-crm-muted"
        }`}>
          {messagePreview}
        </p>

        {/* Indicators Row */}
        <div className="flex items-center gap-1.5 mt-1">
          {conversation.pinned && (
            <Pin className="h-3 w-3 text-crm-primary fill-crm-primary rotate-45 shrink-0" />
          )}
          {conversation.muted && (
            <BellOff className="h-3 w-3 text-crm-muted shrink-0" />
          )}
        </div>
      </div>

      {/* Unread Count Badge */}
      {conversation.unreadCount > 0 && !isSelected && (
        <div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-crm-primary px-1 text-[10px] font-bold text-white shadow-sm animate-in zoom-in duration-200">
          {conversation.unreadCount}
        </div>
      )}
    </button>
  );
}

// Simple memoized helper for time formatting inside conversation item
function useMemoTime(date: Date | string | null | undefined) {
  return React.useMemo(() => {
    if (!date) return "";
    const parsed = new Date(date);
    const now = new Date();

    const isToday = parsed.toDateString() === now.toDateString();
    if (isToday) {
      return parsed.toLocaleTimeString("en-PK", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    const isThisYear = parsed.getFullYear() === now.getFullYear();
    if (isThisYear) {
      return parsed.toLocaleDateString("en-PK", {
        month: "short",
        day: "numeric",
      });
    }

    return parsed.toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [date]);
}
