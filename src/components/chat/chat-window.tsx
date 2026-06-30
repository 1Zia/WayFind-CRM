"use client";

import React, { useState, useEffect, useRef } from "react";
import { Pin, BellOff, Loader2, Eye, EyeOff, Archive, Users, Folder, CheckSquare, MessageSquare, ChevronLeft } from "lucide-react";
import { MessageList } from "./message-list";
import { MessageComposer } from "./message-composer";
import { ChatMemberList } from "./chat-member-list";
import { toast } from "sonner";
import {
  getConversationById,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
  togglePinConversation,
  toggleMuteConversation,
  archiveConversation,
} from "@/lib/actions/chat";
import { getPresenceStatus, formatPresenceStatus } from "@/lib/presence";

type Participant = {
  id: string;
  userId: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: "owner" | "admin" | "member";
  roleInSystem: string;
  lastSeenAt: Date | null;
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
  reactions: any[];
};

type ConversationDetails = {
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
  currentUserRole: "owner" | "admin" | "member";
};

type ActiveUser = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: string;
};

type ChatWindowProps = {
  conversationId: string;
  currentUserId: string;
  currentUserRole: string;
  uploadReady: boolean;
  allUsersList: ActiveUser[];
  onRefreshSidebar: () => void;
  onArchiveSelected: () => void;
  onBack?: () => void;
};

export function ChatWindow({
  conversationId,
  currentUserId,
  currentUserRole,
  uploadReady,
  allUsersList,
  onRefreshSidebar,
  onArchiveSelected,
  onBack,
}: ChatWindowProps) {
  const [convDetails, setConvDetails] = useState<ConversationDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);

  const pollIntervalRef = useRef<number | null>(null);

  // Fetch full conversation details & messages
  const fetchDetailsAndMessages = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const details = await getConversationById(conversationId);
      setConvDetails(details as ConversationDetails);

      const msgs = await getConversationMessages(conversationId);
      // Map to correct Date object
      setMessages(
        msgs.map((m) => ({
          ...m,
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt),
        })) as Message[]
      );

      // Mark as read
      await markConversationAsRead(conversationId);
      onRefreshSidebar();
    } catch (error) {
      console.error("Error loading chat window", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Initial load and visibility-aware polling setup
  useEffect(() => {
    void fetchDetailsAndMessages(true);

    // Visibility-aware polling
    const startPolling = () => {
      stopPolling();
      pollIntervalRef.current = window.setInterval(() => {
        if (!document.hidden) {
          void fetchDetailsAndMessages(false);
        }
      }, 5000);
    };

    const stopPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };

    startPolling();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [conversationId]);

  // Pin Toggle Action
  async function handleTogglePin() {
    if (!convDetails) return;
    try {
      const nextPin = !convDetails.pinned;
      await togglePinConversation(conversationId, nextPin);
      setConvDetails((prev) => prev ? { ...prev, pinned: nextPin } : null);
      toast.success(nextPin ? "Conversation pinned" : "Conversation unpinned");
      onRefreshSidebar();
    } catch {
      toast.error("Failed to pin conversation.");
    }
  }

  // Mute Toggle Action
  async function handleToggleMute() {
    if (!convDetails) return;
    try {
      const nextMute = !convDetails.muted;
      await toggleMuteConversation(conversationId, nextMute);
      setConvDetails((prev) => prev ? { ...prev, muted: nextMute } : null);
      toast.success(nextMute ? "Conversation muted" : "Conversation unmuted");
      onRefreshSidebar();
    } catch {
      toast.error("Failed to mute conversation.");
    }
  }

  // Archive Action
  async function handleArchive() {
    if (!confirm("Are you sure you want to archive this conversation?")) return;
    try {
      await archiveConversation(conversationId);
      toast.success("Conversation archived.");
      onArchiveSelected();
    } catch {
      toast.error("Failed to archive conversation.");
    }
  }

  // Send Message Action
  async function handleSendMessage(content: string, attachment: any | null) {
    try {
      const result = await sendMessage({
        conversationId,
        content,
        parentMessageId: replyToMessage?.id || null,
        attachment,
      });

      if (result.success) {
        setReplyToMessage(null);
        void fetchDetailsAndMessages(false);
        return true;
      }
      return false;
    } catch (e) {
      toast.error("Failed to send message.");
      return false;
    }
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-crm-surface rounded-card border border-crm-border shadow-card">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-crm-primary" />
          <span className="text-sm text-crm-muted">Loading conversation...</span>
        </div>
      </div>
    );
  }

  if (!convDetails) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-crm-surface rounded-card border border-crm-border shadow-card">
        <span className="text-sm text-crm-muted">Conversation not found.</span>
      </div>
    );
  }

  // Details extraction
  const otherParticipant =
    convDetails.type === "direct"
      ? convDetails.participants.find((p) => p.userId !== currentUserId)
      : null;

  const title = otherParticipant ? otherParticipant.name : convDetails.name || "Group Chat";
  const presence = otherParticipant ? getPresenceStatus(otherParticipant.lastSeenAt) : null;
  const isGroup = convDetails.type !== "direct";
  const isOwnerOrAdmin =
    convDetails.currentUserRole === "owner" ||
    convDetails.currentUserRole === "admin" ||
    currentUserRole === "super_admin";

  return (
    <div className="flex h-full w-full flex-col bg-crm-surface rounded-card border border-crm-border shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-crm-border-soft bg-crm-body/50 backdrop-blur-sm z-10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden mr-1 p-1 text-crm-muted hover:bg-crm-body rounded-full transition-colors shrink-0"
              title="Back to Chats List"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {/* Avatar Icon */}
          <div className="relative h-10 w-10 shrink-0 select-none">
            {convDetails.type === "direct" ? (
              <>
                {otherParticipant?.imageUrl ? (
                  <img
                    src={otherParticipant.imageUrl}
                    alt={title}
                    className="h-10 w-10 rounded-full object-cover border border-crm-border-soft"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-crm-primary-soft text-crm-primary font-bold text-sm">
                    {title.charAt(0).toUpperCase()}
                  </div>
                )}
                {presence && (
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-crm-surface ${
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-crm-secondary-soft text-crm-secondary font-bold border border-crm-border-soft">
                {convDetails.projectId ? (
                  <Folder className="h-5 w-5" />
                ) : convDetails.taskId ? (
                  <CheckSquare className="h-5 w-5" />
                ) : (
                  <MessageSquare className="h-5 w-5" />
                )}
              </div>
            )}
          </div>

          {/* Title & Info */}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-crm-heading">{title}</h3>
            {convDetails.type === "direct" ? (
              <p className="text-[10px] text-crm-muted flex items-center gap-1">
                <span className="capitalize">{presence ? formatPresenceStatus(presence) : "Offline"}</span>
              </p>
            ) : (
              <button
                onClick={() => setShowMembersModal(true)}
                className="text-[10px] text-crm-primary font-medium hover:underline flex items-center gap-1"
              >
                <span>{convDetails.participants.length} participants</span>
              </button>
            )}
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Toggle Pin */}
          <button
            onClick={handleTogglePin}
            className={`rounded-lg p-2 transition-colors ${
              convDetails.pinned
                ? "text-crm-primary bg-crm-primary-soft/50"
                : "text-crm-muted hover:bg-crm-body hover:text-crm-heading"
            }`}
            title={convDetails.pinned ? "Unpin Chat" : "Pin Chat"}
          >
            <Pin className={`h-4.5 w-4.5 ${convDetails.pinned ? "rotate-45" : ""}`} />
          </button>

          {/* Toggle Mute */}
          <button
            onClick={handleToggleMute}
            className={`rounded-lg p-2 transition-colors ${
              convDetails.muted
                ? "text-crm-muted bg-crm-body"
                : "text-crm-muted hover:bg-crm-body hover:text-crm-heading"
            }`}
            title={convDetails.muted ? "Unmute Chat" : "Mute Chat"}
          >
            {convDetails.muted ? <EyeOff className="h-4.5 w-4.5 text-crm-muted" /> : <Eye className="h-4.5 w-4.5 text-crm-muted" />}
          </button>

          {/* Group Members List */}
          {isGroup && (
            <button
              onClick={() => setShowMembersModal(true)}
              className="rounded-lg p-2 text-crm-muted hover:bg-crm-body hover:text-crm-heading transition-colors"
              title="Group Members"
            >
              <Users className="h-4.5 w-4.5" />
            </button>
          )}

          {/* Archive Button if Admin */}
          {isGroup && isOwnerOrAdmin && (
            <button
              onClick={handleArchive}
              className="rounded-lg p-2 text-crm-danger hover:bg-crm-danger-soft transition-colors"
              title="Archive Conversation"
            >
              <Archive className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-crm-body/20">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onReply={(msg) => setReplyToMessage(msg)}
          onRefresh={() => void fetchDetailsAndMessages(false)}
        />
      </div>

      {/* Composer Bottom Area */}
      <div className="shrink-0">
        <MessageComposer
          uploadReady={uploadReady}
          replyToMessage={replyToMessage}
          onCancelReply={() => setReplyToMessage(null)}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Group Members overlay modal */}
      {isGroup && (
        <ChatMemberList
          isOpen={showMembersModal}
          onClose={() => setShowMembersModal(false)}
          conversationId={conversationId}
          conversationName={title}
          participants={convDetails.participants}
          currentUserRole={convDetails.currentUserRole}
          currentUserSystemRole={currentUserRole}
          allUsersList={allUsersList}
          onRefresh={fetchDetailsAndMessages}
        />
      )}
    </div>
  );
}
