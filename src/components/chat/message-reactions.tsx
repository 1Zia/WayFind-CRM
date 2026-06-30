"use client";

import React, { useMemo } from "react";
import { addReaction, removeReaction } from "@/lib/actions/chat";
import { toast } from "sonner";

type Reaction = {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  userName: string | null;
};

type MessageReactionsProps = {
  messageId: string;
  reactions: Reaction[];
  currentUserId: string;
  onRefresh: () => void;
};

export function MessageReactions({
  messageId,
  reactions,
  currentUserId,
  onRefresh,
}: MessageReactionsProps) {
  // Group reactions by emoji
  const groupedReactions = useMemo(() => {
    const groups: Record<
      string,
      { count: number; userReacted: boolean; names: string[] }
    > = {};

    reactions.forEach((r) => {
      if (!groups[r.emoji]) {
        groups[r.emoji] = { count: 0, userReacted: false, names: [] };
      }
      groups[r.emoji].count += 1;
      if (r.userId === currentUserId) {
        groups[r.emoji].userReacted = true;
      }
      if (r.userName) {
        groups[r.emoji].names.push(r.userName);
      }
    });

    return Object.entries(groups).map(([emoji, data]) => ({
      emoji,
      ...data,
    }));
  }, [reactions, currentUserId]);

  if (reactions.length === 0) return null;

  async function handleEmojiClick(emoji: string, userReacted: boolean) {
    try {
      if (userReacted) {
        await removeReaction(messageId, emoji);
      } else {
        await addReaction(messageId, emoji);
      }
      onRefresh();
    } catch (error) {
      toast.error("Failed to update reaction.");
    }
  }

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {groupedReactions.map(({ emoji, count, userReacted, names }) => (
        <button
          key={emoji}
          onClick={() => handleEmojiClick(emoji, userReacted)}
          title={names.join(", ")}
          className={`group flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border transition-all ${
            userReacted
              ? "border-crm-primary bg-crm-primary-soft/40 text-crm-primary font-semibold"
              : "border-crm-border bg-crm-surface text-crm-muted hover:border-crm-muted/50 hover:text-crm-heading"
          }`}
        >
          <span>{emoji}</span>
          <span className="text-[10px]">{count}</span>
        </button>
      ))}
    </div>
  );
}
