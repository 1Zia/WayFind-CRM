"use client";

import React from "react";
import { X, CornerDownRight } from "lucide-react";

type ReplyPreviewProps = {
  message: {
    id: string;
    senderName: string | null;
    content: string;
  } | null;
  onClear: () => void;
};

export function ReplyPreview({ message, onClear }: ReplyPreviewProps) {
  if (!message) return null;

  return (
    <div className="flex items-center justify-between border-t border-crm-border bg-crm-primary-soft/20 px-4 py-2 animate-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center gap-2 min-w-0">
        <CornerDownRight className="h-4 w-4 text-crm-primary shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-crm-primary">
            Replying to {message.senderName || "Teammate"}
          </p>
          <p className="truncate text-xs text-crm-muted">
            {message.content}
          </p>
        </div>
      </div>
      <button
        onClick={onClear}
        className="rounded-full p-1 text-crm-muted hover:bg-crm-primary-soft/50 hover:text-crm-heading transition-colors shrink-0"
        title="Cancel reply"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
