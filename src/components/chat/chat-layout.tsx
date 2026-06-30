"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { ChatSidebar } from "./chat-sidebar";
import { ChatWindow } from "./chat-window";
import { NewChatDialog } from "./new-chat-dialog";
import { GroupChatDialog } from "./group-chat-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { getConversations } from "@/lib/actions/chat";

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

type ActiveUser = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: string;
  lastSeenAt: Date | null;
};

type ProjectOption = {
  id: string;
  name: string;
};

type TaskOption = {
  id: string;
  title: string;
};

type ChatLayoutProps = {
  currentUserId: string;
  currentUserRole: string;
  uploadReady: boolean;
  usersList: ActiveUser[];
  projectsList: ProjectOption[];
  tasksList: TaskOption[];
};

export function ChatLayout({
  currentUserId,
  currentUserRole,
  uploadReady,
  usersList,
  projectsList,
  tasksList,
}: ChatLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("id"));
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);

  // Load conversations list
  const loadConversationsList = async () => {
    try {
      const list = await getConversations();
      // Map to correct types (dates)
      setConversations(
        list.map((c) => ({
          ...c,
          lastMessageAt: c.lastMessageAt ? new Date(c.lastMessageAt) : null,
          lastMessage: c.lastMessage
            ? { ...c.lastMessage, createdAt: new Date(c.lastMessage.createdAt) }
            : null,
          participants: c.participants.map((p) => ({
            ...p,
            lastSeenAt: p.lastSeenAt ? new Date(p.lastSeenAt) : null,
          })),
        })) as Conversation[]
      );
    } catch (e) {
      console.error("Failed to load conversations", e);
    }
  };

  useEffect(() => {
    void loadConversationsList();
    // Refresh list every 8 seconds for unread updates in sidebar
    const interval = setInterval(() => {
      void loadConversationsList();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Sync selectedId with query param
  useEffect(() => {
    const id = searchParams.get("id");
    setSelectedId(id);
  }, [searchParams]);

  function handleSelectConversation(id: string) {
    setSelectedId(id);
    router.push(`/chat?id=${id}`);
  }

  function handleBack() {
    setSelectedId(null);
    router.push("/chat");
  }

  function handleConversationCreated(id: string) {
    void loadConversationsList();
    handleSelectConversation(id);
  }

  return (
    <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden rounded-card border border-crm-border bg-crm-surface shadow-card">
      {/* Sidebar - Hidden on mobile when a chat is selected */}
      <div className={`h-full w-full lg:w-[320px] xl:w-[360px] shrink-0 ${
        selectedId ? "hidden lg:flex" : "flex"
      }`}>
        <ChatSidebar
          conversations={conversations}
          selectedId={selectedId}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onSelectConversation={handleSelectConversation}
          onOpenNewChat={() => setIsNewChatOpen(true)}
          onOpenNewGroup={() => setIsNewGroupOpen(true)}
        />
      </div>

      {/* Main chat viewport window - Hidden on mobile when no chat is selected */}
      <div className={`flex-1 h-full ${
        selectedId ? "flex" : "hidden lg:flex"
      }`}>
        {selectedId ? (
          <ChatWindow
            conversationId={selectedId}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            uploadReady={uploadReady}
            allUsersList={usersList}
            onRefreshSidebar={() => void loadConversationsList()}
            onArchiveSelected={() => {
              setSelectedId(null);
              router.push("/chat");
              void loadConversationsList();
            }}
            onBack={handleBack}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 bg-crm-body/10 h-full">
            <EmptyState
              title="Select a conversation"
              description="Choose a teammate or group chat from the sidebar to start messaging."
              icon={MessageSquare}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <NewChatDialog
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        usersList={usersList}
        onConversationCreated={handleConversationCreated}
      />

      <GroupChatDialog
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
        usersList={usersList}
        projectsList={projectsList}
        tasksList={tasksList}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}
