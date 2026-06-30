"use client";

import React, { useState } from "react";
import { CornerUpLeft, Edit3, Trash2, Smile, FileText, Download, Check, X, ShieldAlert } from "lucide-react";
import { MessageReactions } from "./message-reactions";
import { toast } from "sonner";
import { editMessage, deleteMessage, addReaction } from "@/lib/actions/chat";

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

type MessageBubbleProps = {
  message: Message;
  currentUserId: string;
  currentUserRole: string;
  parentMessage: { senderName: string | null; content: string } | null;
  onReply: (message: Message) => void;
  onRefresh: () => void;
};

const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export function MessageBubble({
  message,
  currentUserId,
  currentUserRole,
  parentMessage,
  onReply,
  onRefresh,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [updating, setUpdating] = useState(false);

  const isSelf = message.senderId === currentUserId;
  const canModify = isSelf || currentUserRole === "super_admin";
  const formattedTime = new Date(message.createdAt).toLocaleTimeString("en-PK", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editContent.trim()) {
      toast.error("Message content cannot be empty.");
      return;
    }
    setUpdating(true);
    try {
      const result = await editMessage(message.id, editContent);
      if (result.success) {
        setIsEditing(false);
        onRefresh();
      } else {
        toast.error("Failed to edit message.");
      }
    } catch (error) {
      toast.error("Error editing message.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this message?")) return;
    setUpdating(true);
    try {
      const result = await deleteMessage(message.id);
      if (result.success) {
        onRefresh();
      } else {
        toast.error("Failed to delete message.");
      }
    } catch (error) {
      toast.error("Error deleting message.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleReact(emoji: string) {
    try {
      await addReaction(message.id, emoji);
      setShowEmojiPicker(false);
      onRefresh();
    } catch (error) {
      toast.error("Failed to react.");
    }
  }

  if (message.type === "system") {
    return (
      <div className="flex justify-center my-2">
        <div className="rounded-full bg-crm-body px-3 py-1 text-[10px] font-medium text-crm-muted border border-crm-border-soft flex items-center gap-1.5 shadow-sm">
          <ShieldAlert className="h-3 w-3 text-crm-muted" />
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative flex gap-3 my-4 max-w-[85%] ${isSelf ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
      {/* Sender Avatar */}
      {!isSelf && (
        <div className="h-9 w-9 shrink-0 select-none">
          {message.senderImageUrl ? (
            <img
              src={message.senderImageUrl}
              alt={message.senderName || "Sender"}
              className="h-9 w-9 rounded-full object-cover border border-crm-border-soft"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-crm-primary-soft text-crm-primary text-xs font-bold">
              {(message.senderName || "U").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Bubble Content */}
      <div className="flex flex-col min-w-0">
        {/* Name and time */}
        {!isSelf && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs font-bold text-crm-heading">{message.senderName}</span>
            <span className="text-[9px] text-crm-muted">{formattedTime}</span>
          </div>
        )}

        {/* Message bubble itself */}
        <div
          className={`relative rounded-2xl px-4 py-2.5 shadow-card border text-sm transition-all duration-200 ${
            message.isDeleted
              ? "border-dashed border-crm-border bg-crm-body text-crm-muted italic"
              : isSelf
              ? "bg-crm-primary border-crm-primary/80 text-white rounded-tr-none"
              : "bg-crm-surface border-crm-border-soft text-crm-heading rounded-tl-none"
          }`}
        >
          {/* Parent Message Reference Preview */}
          {parentMessage && !message.isDeleted && (
            <div className={`mb-1.5 border-l-2 pl-2 py-0.5 text-xs truncate rounded-sm ${
              isSelf ? "border-white/50 text-white/80 bg-white/10" : "border-crm-primary/50 text-crm-muted bg-crm-primary-soft/20"
            }`}>
              <p className="font-bold text-[10px]">
                Reply to {parentMessage.senderName || "Teammate"}
              </p>
              <p className="italic truncate">{parentMessage.content}</p>
            </div>
          )}

          {/* Body content / Editing input */}
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="flex items-center gap-1.5 py-1">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="rounded border border-white/30 bg-transparent px-2 py-0.5 text-sm text-white outline-none focus:border-white"
                autoFocus
              />
              <button
                type="submit"
                disabled={updating}
                className="rounded-full bg-white/20 p-1 text-white hover:bg-white/30"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full bg-white/20 p-1 text-white hover:bg-white/30"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </form>
          ) : (
            <>
              {/* Text / File Content */}
              {message.type === "file" && message.attachmentUrl && (
                <div className="mb-2">
                  {message.attachmentType?.startsWith("image/") ? (
                    <a href={message.attachmentUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={message.attachmentUrl}
                        alt={message.attachmentName || "Attachment"}
                        className="max-h-[200px] max-w-full rounded-lg object-contain border border-crm-border-soft hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ) : (
                    <div className={`flex items-center gap-2 rounded-lg p-2 text-xs border ${
                      isSelf ? "bg-white/10 border-white/20" : "bg-crm-body border-crm-border"
                    }`}>
                      <FileText className="h-5 w-5 text-crm-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{message.attachmentName}</p>
                        <p className="text-[10px] text-crm-muted">
                          {message.attachmentSize
                            ? `${(message.attachmentSize / 1024).toFixed(1)} KB`
                            : "Unknown size"}
                        </p>
                      </div>
                      <a
                        href={message.attachmentUrl}
                        download={message.attachmentName || "file"}
                        className={`rounded-full p-1.5 hover:bg-black/10 transition-colors shrink-0`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
              )}
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </>
          )}

          {/* Edited indicator */}
          {message.isEdited && !message.isDeleted && (
            <span className={`float-right ml-2 mt-1 text-[9px] ${isSelf ? "text-white/60" : "text-crm-muted"}`}>
              (edited)
            </span>
          )}

          {/* Time indicator for self */}
          {isSelf && (
            <span className="float-right ml-2 mt-1 text-[9px] text-white/60">
              {formattedTime}
            </span>
          )}
        </div>

        {/* Reactions List */}
        <MessageReactions
          messageId={message.id}
          reactions={message.reactions}
          currentUserId={currentUserId}
          onRefresh={onRefresh}
        />
      </div>

      {/* Floating Action Toolbar on hover */}
      {!message.isDeleted && !isEditing && (
        <div className={`absolute top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex items-center gap-1 bg-crm-surface border border-crm-border rounded-lg p-1 shadow-dropdown transition-all animate-in fade-in slide-in-from-top-1 duration-150 ${
          isSelf ? "right-full mr-2" : "left-full ml-2"
        }`}>
          {/* Reaction Picker Button */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="rounded-md p-1.5 text-crm-muted hover:bg-crm-body hover:text-crm-heading"
              title="Add Reaction"
            >
              <Smile className="h-4 w-4" />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 z-20 mb-2 flex gap-1 rounded-full border border-crm-border bg-crm-surface p-1 shadow-dropdown animate-in zoom-in duration-100">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReact(emoji)}
                    className="h-7 w-7 text-sm hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reply */}
          <button
            onClick={() => onReply(message)}
            className="rounded-md p-1.5 text-crm-muted hover:bg-crm-body hover:text-crm-heading"
            title="Reply"
          >
            <CornerUpLeft className="h-4 w-4" />
          </button>

          {/* Edit */}
          {canModify && message.type !== "file" && (
            <button
              onClick={() => {
                setIsEditing(true);
                setEditContent(message.content);
              }}
              className="rounded-md p-1.5 text-crm-muted hover:bg-crm-body hover:text-crm-heading"
              title="Edit"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}

          {/* Delete */}
          {canModify && (
            <button
              onClick={handleDelete}
              disabled={updating}
              className="rounded-md p-1.5 text-crm-danger hover:bg-crm-danger-soft"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
