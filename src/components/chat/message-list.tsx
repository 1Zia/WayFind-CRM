"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { MessageBubble } from "./message-bubble";

type Reaction = {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  userName: string | null;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "file" | "system";
  parentMessageId: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentType: string | null;
  attachmentSize: number | null;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  senderName: string | null;
  senderImageUrl: string | null;
  reactions: Reaction[];
};

type MessageListProps = {
  messages: Message[];
  currentUserId: string;
  currentUserRole: string;
  onReply: (message: Message) => void;
  onRefresh: () => void;
};

export function MessageList({
  messages,
  currentUserId,
  currentUserRole,
  onReply,
  onRefresh,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages list size updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Map of all messages for fast parent message lookup
  const messageMap = useMemo(() => {
    const map = new Map<string, { senderName: string | null; content: string }>();
    messages.forEach((m) => {
      map.set(m.id, { senderName: m.senderName, content: m.content });
    });
    return map;
  }, [messages]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { dateLabel: string; msgs: Message[] }[] = [];
    let lastDateLabel = "";

    messages.forEach((msg) => {
      const dateLabel = formatGroupDate(msg.createdAt);
      if (dateLabel !== lastDateLabel) {
        groups.push({ dateLabel, msgs: [] });
        lastDateLabel = dateLabel;
      }
      groups[groups.length - 1].msgs.push(msg);
    });

    return groups;
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
        <h4 className="text-sm font-bold text-crm-heading">No Messages Yet</h4>
        <p className="mt-1 text-xs text-crm-muted max-w-[200px]">
          Send the first message to start the conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2">
      {groupedMessages.map((group) => (
        <div key={group.dateLabel} className="space-y-1">
          {/* Date Separator */}
          <div className="flex justify-center my-4">
            <div className="rounded-full bg-crm-body px-3 py-1 text-[10px] font-semibold text-crm-muted border border-crm-border-soft">
              {group.dateLabel}
            </div>
          </div>

          {/* Messages in Group */}
          {group.msgs.map((msg) => {
            const parentMsg = msg.parentMessageId ? messageMap.get(msg.parentMessageId) || null : null;
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                parentMessage={parentMsg}
                onReply={onReply}
                onRefresh={onRefresh}
              />
            );
          })}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function formatGroupDate(dateInput: Date | string) {
  const date = new Date(dateInput);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) {
    return "Today";
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  const isThisYear = date.getFullYear() === now.getFullYear();
  if (isThisYear) {
    return date.toLocaleDateString("en-PK", {
      month: "long",
      day: "numeric",
    });
  }

  return date.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
