"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, desc, eq, inArray, not, sql, ilike } from "drizzle-orm";

import { db } from "@/db";
import {
  chatConversations,
  chatParticipants,
  chatMessages,
  chatReactions,
  users,
  notifications,
} from "@/db/schema";
import { createAuditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { createSystemNotification } from "@/lib/actions/notifications";
import {
  createDirectConversationSchema,
  createGroupConversationSchema,
  sendMessageSchema,
  editMessageSchema,
  deleteMessageSchema,
  addReactionSchema,
  removeReactionSchema,
  markConversationAsReadSchema,
  updateGroupDetailsSchema,
} from "@/lib/validations/chat";

export async function getActiveUsers() {
  await requireUser();

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      imageUrl: users.imageUrl,
      role: users.role,
      lastSeenAt: users.lastSeenAt,
    })
    .from(users)
    .where(eq(users.status, "active"))
    .orderBy(users.name);
}

export async function getConversations() {
  const user = await requireUser();

  // Find all conversation IDs the user is part of
  const userParticipations = await db
    .select({ conversationId: chatParticipants.conversationId })
    .from(chatParticipants)
    .where(eq(chatParticipants.userId, user.id));

  if (userParticipations.length === 0) {
    return [];
  }

  const conversationIds = userParticipations.map((p) => p.conversationId);

  // Fetch conversations
  const conversationsList = await db
    .select({
      id: chatConversations.id,
      type: chatConversations.type,
      name: chatConversations.name,
      description: chatConversations.description,
      projectId: chatConversations.projectId,
      taskId: chatConversations.taskId,
      createdById: chatConversations.createdById,
      createdAt: chatConversations.createdAt,
      updatedAt: chatConversations.updatedAt,
      lastMessageAt: chatConversations.lastMessageAt,
      isArchived: chatConversations.isArchived,
      role: chatParticipants.role,
      lastReadAt: chatParticipants.lastReadAt,
      muted: chatParticipants.muted,
      pinned: chatParticipants.pinned,
    })
    .from(chatConversations)
    .innerJoin(
      chatParticipants,
      and(
        eq(chatParticipants.conversationId, chatConversations.id),
        eq(chatParticipants.userId, user.id)
      )
    )
    .where(
      and(
        inArray(chatConversations.id, conversationIds),
        eq(chatConversations.isArchived, false)
      )
    );

  // For each conversation, fetch all participants and the last message
  const result = await Promise.all(
    conversationsList.map(async (conv) => {
      // Get participants
      const parts = await db
        .select({
          id: chatParticipants.id,
          role: chatParticipants.role,
          joinedAt: chatParticipants.joinedAt,
          lastReadAt: chatParticipants.lastReadAt,
          userId: users.id,
          name: users.name,
          email: users.email,
          imageUrl: users.imageUrl,
          roleInSystem: users.role,
          lastSeenAt: users.lastSeenAt,
        })
        .from(chatParticipants)
        .innerJoin(users, eq(users.id, chatParticipants.userId))
        .where(eq(chatParticipants.conversationId, conv.id));

      // Get last message
      const [lastMsg] = await db
        .select({
          id: chatMessages.id,
          content: chatMessages.content,
          type: chatMessages.type,
          createdAt: chatMessages.createdAt,
          senderId: chatMessages.senderId,
          senderName: users.name,
        })
        .from(chatMessages)
        .leftJoin(users, eq(users.id, chatMessages.senderId))
        .where(eq(chatMessages.conversationId, conv.id))
        .orderBy(desc(chatMessages.createdAt))
        .limit(1);

      // Calculate unread count
      // Messages created after current user's lastReadAt, excluding messages sent by user
      let unreadCount = 0;
      try {
        const unreadQuery = db
          .select({ count: sql<number>`count(*)` })
          .from(chatMessages)
          .where(
            and(
              eq(chatMessages.conversationId, conv.id),
              not(eq(chatMessages.senderId, user.id)),
              conv.lastReadAt
                ? sql`${chatMessages.createdAt} > ${conv.lastReadAt}`
                : sql`true`
            )
          );
        const [unreadCountResult] = await unreadQuery;
        unreadCount = Number(unreadCountResult?.count || 0);
      } catch (e) {
        unreadCount = 0;
      }

      return {
        ...conv,
        participants: parts,
        lastMessage: lastMsg || null,
        unreadCount,
      };
    })
  );

  // Sort: pinned first, then by lastMessageAt or updatedAt descending
  return result.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    const timeA = a.lastMessageAt?.getTime() || a.updatedAt.getTime();
    const timeB = b.lastMessageAt?.getTime() || b.updatedAt.getTime();
    return timeB - timeA;
  });
}

export async function getConversationById(conversationId: string) {
  const user = await requireUser();
  const cId = z.string().uuid().parse(conversationId);

  // Verify participant
  const [participant] = await db
    .select()
    .from(chatParticipants)
    .where(
      and(
        eq(chatParticipants.conversationId, cId),
        eq(chatParticipants.userId, user.id)
      )
    )
    .limit(1);

  if (!participant && user.role !== "super_admin") {
    throw new Error("Unauthorized access to conversation");
  }

  const [conversation] = await db
    .select()
    .from(chatConversations)
    .where(eq(chatConversations.id, cId))
    .limit(1);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Get participants
  const parts = await db
    .select({
      id: chatParticipants.id,
      role: chatParticipants.role,
      joinedAt: chatParticipants.joinedAt,
      lastReadAt: chatParticipants.lastReadAt,
      userId: users.id,
      name: users.name,
      email: users.email,
      imageUrl: users.imageUrl,
      roleInSystem: users.role,
      lastSeenAt: users.lastSeenAt,
    })
    .from(chatParticipants)
    .innerJoin(users, eq(users.id, chatParticipants.userId))
    .where(eq(chatParticipants.conversationId, conversation.id));

  return {
    ...conversation,
    participants: parts,
    currentUserRole: participant?.role || "member",
    pinned: participant?.pinned || false,
    muted: participant?.muted || false,
  };
}

export async function getConversationMessages(conversationId: string) {
  const user = await requireUser();
  const cId = z.string().uuid().parse(conversationId);

  // Verify participant
  const [participant] = await db
    .select()
    .from(chatParticipants)
    .where(
      and(
        eq(chatParticipants.conversationId, cId),
        eq(chatParticipants.userId, user.id)
      )
    )
    .limit(1);

  if (!participant && user.role !== "super_admin") {
    throw new Error("Unauthorized access to messages");
  }

  // Fetch 50 latest messages
  const messagesList = await db
    .select({
      id: chatMessages.id,
      conversationId: chatMessages.conversationId,
      senderId: chatMessages.senderId,
      content: chatMessages.content,
      type: chatMessages.type,
      parentMessageId: chatMessages.parentMessageId,
      attachmentUrl: chatMessages.attachmentUrl,
      attachmentName: chatMessages.attachmentName,
      attachmentType: chatMessages.attachmentType,
      attachmentSize: chatMessages.attachmentSize,
      isEdited: chatMessages.isEdited,
      isDeleted: chatMessages.isDeleted,
      createdAt: chatMessages.createdAt,
      updatedAt: chatMessages.updatedAt,
      deletedAt: chatMessages.deletedAt,
      senderName: users.name,
      senderImageUrl: users.imageUrl,
    })
    .from(chatMessages)
    .leftJoin(users, eq(users.id, chatMessages.senderId))
    .where(eq(chatMessages.conversationId, cId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(50);

  // Fetch reactions for each message
  const result = await Promise.all(
    messagesList.map(async (msg) => {
      const reacts = await db
        .select({
          id: chatReactions.id,
          messageId: chatReactions.messageId,
          userId: chatReactions.userId,
          emoji: chatReactions.emoji,
          userName: users.name,
        })
        .from(chatReactions)
        .leftJoin(users, eq(users.id, chatReactions.userId))
        .where(eq(chatReactions.messageId, msg.id));

      return {
        ...msg,
        reactions: reacts,
      };
    })
  );

  // Return sorted by createdAt ascending
  return result.reverse();
}

export async function createDirectConversation(targetUserId: string) {
  const user = await requireUser();
  const targetId = createDirectConversationSchema.parse({ userId: targetUserId }).userId;

  if (user.id === targetId) {
    throw new Error("Cannot create a direct conversation with yourself");
  }

  // Find all direct conversations of user.id
  const userDirectConvs = await db
    .select({ conversationId: chatParticipants.conversationId })
    .from(chatParticipants)
    .innerJoin(chatConversations, eq(chatConversations.id, chatParticipants.conversationId))
    .where(
      and(
        eq(chatConversations.type, "direct"),
        eq(chatParticipants.userId, user.id)
      )
    );

  if (userDirectConvs.length > 0) {
    const convIds = userDirectConvs.map((c) => c.conversationId);
    // Find if any of these also has targetId as a participant
    const matchingConv = await db
      .select({ conversationId: chatParticipants.conversationId })
      .from(chatParticipants)
      .where(
        and(
          inArray(chatParticipants.conversationId, convIds),
          eq(chatParticipants.userId, targetId)
        )
      )
      .limit(1);

    if (matchingConv.length > 0) {
      return { success: true, conversationId: matchingConv[0].conversationId };
    }
  }

  // Create new conversation
  const [newConv] = await db
    .insert(chatConversations)
    .values({
      type: "direct",
      createdById: user.id,
    })
    .returning();

  // Add participants
  await db.insert(chatParticipants).values([
    {
      conversationId: newConv.id,
      userId: user.id,
      role: "owner",
    },
    {
      conversationId: newConv.id,
      userId: targetId,
      role: "member",
    },
  ]);

  revalidatePath("/chat");

  return { success: true, conversationId: newConv.id };
}

export async function createGroupConversation(input: {
  name: string;
  participantIds: string[];
  description?: string;
  projectId?: string;
  taskId?: string;
}) {
  const user = await requireUser();
  const data = createGroupConversationSchema.parse(input);

  // Only super_admin and project_manager can create group conversations
  if (user.role !== "super_admin" && user.role !== "project_manager") {
    throw new Error("Only admins and project managers can create groups");
  }

  const hasProject = !!data.projectId && data.projectId.trim().length > 0;
  const hasTask = !!data.taskId && data.taskId.trim().length > 0;

  // Create group
  const [newConv] = await db
    .insert(chatConversations)
    .values({
      type: hasProject ? "project" : hasTask ? "task" : "group",
      name: data.name,
      description: data.description || null,
      projectId: hasProject ? data.projectId : null,
      taskId: hasTask ? data.taskId : null,
      createdById: user.id,
    })
    .returning();

  // Deduplicate and combine participant IDs (make sure creator is included)
  const uniqueParticipantIds = Array.from(
    new Set([user.id, ...data.participantIds])
  );

  // Insert participants
  const participantsValues = uniqueParticipantIds.map((pId) => ({
    conversationId: newConv.id,
    userId: pId,
    role: pId === user.id ? ("owner" as const) : ("member" as const),
  }));

  await db.insert(chatParticipants).values(participantsValues);

  await createAuditLog({
    userId: user.id,
    action: "create_group_chat",
    entityType: "chat_conversation",
    entityId: newConv.id,
    description: `Created group chat "${data.name}"`,
  });

  revalidatePath("/chat");

  return { success: true, conversationId: newConv.id };
}

export async function sendMessage(input: {
  conversationId: string;
  content: string;
  parentMessageId?: string | null;
  attachment?: {
    url: string;
    name: string;
    type: string;
    size: number;
  } | null;
}) {
  const user = await requireUser();
  const data = sendMessageSchema.parse(input);

  // Check participation
  const [participation] = await db
    .select()
    .from(chatParticipants)
    .where(
      and(
        eq(chatParticipants.conversationId, data.conversationId),
        eq(chatParticipants.userId, user.id)
      )
    )
    .limit(1);

  if (!participation && user.role !== "super_admin") {
    throw new Error("Unauthorized to send message to this conversation");
  }

  // Insert message
  const [newMsg] = await db
    .insert(chatMessages)
    .values({
      conversationId: data.conversationId,
      senderId: user.id,
      content: data.content,
      type: data.attachment ? "file" : "text",
      parentMessageId: data.parentMessageId || null,
      attachmentUrl: data.attachment?.url || null,
      attachmentName: data.attachment?.name || null,
      attachmentType: data.attachment?.type || null,
      attachmentSize: data.attachment?.size || null,
    })
    .returning();

  // Update conversation's lastMessageAt
  await db
    .update(chatConversations)
    .set({
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(chatConversations.id, data.conversationId));

  // Mark conversation as read for the sender
  await db
    .update(chatParticipants)
    .set({
      lastReadAt: new Date(),
    })
    .where(
      and(
        eq(chatParticipants.conversationId, data.conversationId),
        eq(chatParticipants.userId, user.id)
      )
    );

  // Notify other participants (avoid duplicate spam)
  const otherParticipants = await db
    .select({ userId: chatParticipants.userId })
    .from(chatParticipants)
    .where(
      and(
        eq(chatParticipants.conversationId, data.conversationId),
        not(eq(chatParticipants.userId, user.id))
      )
    );

  if (otherParticipants.length > 0) {
    const [conversation] = await db
      .select({
        name: chatConversations.name,
        type: chatConversations.type,
      })
      .from(chatConversations)
      .where(eq(chatConversations.id, data.conversationId))
      .limit(1);

    const title = conversation?.name || `${user.name}`;
    const messagePreview = `${user.name}: ${
      data.content ? data.content.substring(0, 60) : "Sent an attachment"
    }`;

    await Promise.all(
      otherParticipants.map(async (p) => {
        // Skip spam: check if they already have an unread system notification for this conversation
        const [existing] = await db
          .select()
          .from(notifications)
          .where(
            and(
              eq(notifications.userId, p.userId),
              eq(notifications.title, title),
              eq(notifications.isRead, false)
            )
          )
          .limit(1);

        if (!existing) {
          await createSystemNotification({
            userId: p.userId,
            title,
            message: messagePreview,
            type: "system",
          });
        }
      })
    );
  }

  revalidatePath("/chat");

  return { success: true, data: newMsg };
}

export async function editMessage(messageId: string, content: string) {
  const user = await requireUser();
  const data = editMessageSchema.parse({ messageId, content });

  const [message] = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.id, data.messageId))
    .limit(1);

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.senderId !== user.id && user.role !== "super_admin") {
    throw new Error("Unauthorized to edit this message");
  }

  if (message.isDeleted) {
    throw new Error("Cannot edit a deleted message");
  }

  const [updatedMsg] = await db
    .update(chatMessages)
    .set({
      content: data.content,
      isEdited: true,
      updatedAt: new Date(),
    })
    .where(eq(chatMessages.id, data.messageId))
    .returning();

  revalidatePath("/chat");

  return { success: true, data: updatedMsg };
}

export async function deleteMessage(messageId: string) {
  const user = await requireUser();
  const data = deleteMessageSchema.parse({ messageId });

  const [message] = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.id, data.messageId))
    .limit(1);

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.senderId !== user.id && user.role !== "super_admin") {
    throw new Error("Unauthorized to delete this message");
  }

  const [updatedMsg] = await db
    .update(chatMessages)
    .set({
      content: "This message was deleted",
      isDeleted: true,
      deletedAt: new Date(),
      attachmentUrl: null,
      attachmentName: null,
      attachmentType: null,
      attachmentSize: null,
      updatedAt: new Date(),
    })
    .where(eq(chatMessages.id, data.messageId))
    .returning();

  await createAuditLog({
    userId: user.id,
    action: "delete_chat_message",
    entityType: "chat_message",
    entityId: message.id,
    description: `Deleted message by user ${message.senderId}`,
  });

  revalidatePath("/chat");

  return { success: true, data: updatedMsg };
}

export async function addReaction(messageId: string, emoji: string) {
  const user = await requireUser();
  const data = addReactionSchema.parse({ messageId, emoji });

  const [message] = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.id, data.messageId))
    .limit(1);

  if (!message) {
    throw new Error("Message not found");
  }

  // Check participation
  const [participation] = await db
    .select()
    .from(chatParticipants)
    .where(
      and(
        eq(chatParticipants.conversationId, message.conversationId),
        eq(chatParticipants.userId, user.id)
      )
    )
    .limit(1);

  if (!participation && user.role !== "super_admin") {
    throw new Error("Unauthorized to react to messages in this conversation");
  }

  // Check if reaction already exists
  const [existing] = await db
    .select()
    .from(chatReactions)
    .where(
      and(
        eq(chatReactions.messageId, data.messageId),
        eq(chatReactions.userId, user.id),
        eq(chatReactions.emoji, data.emoji)
      )
    )
    .limit(1);

  if (existing) {
    return { success: true };
  }

  await db.insert(chatReactions).values({
    messageId: data.messageId,
    userId: user.id,
    emoji: data.emoji,
  });

  revalidatePath("/chat");

  return { success: true };
}

export async function removeReaction(messageId: string, emoji: string) {
  const user = await requireUser();
  const data = removeReactionSchema.parse({ messageId, emoji });

  await db
    .delete(chatReactions)
    .where(
      and(
        eq(chatReactions.messageId, data.messageId),
        eq(chatReactions.userId, user.id),
        eq(chatReactions.emoji, data.emoji)
      )
    );

  revalidatePath("/chat");

  return { success: true };
}

export async function markConversationAsRead(conversationId: string) {
  const user = await requireUser();
  const cId = markConversationAsReadSchema.parse({ conversationId }).conversationId;

  await db
    .update(chatParticipants)
    .set({
      lastReadAt: new Date(),
    })
    .where(
      and(
        eq(chatParticipants.conversationId, cId),
        eq(chatParticipants.userId, user.id)
      )
    );

  revalidatePath("/chat");

  return { success: true };
}

export async function addParticipants(conversationId: string, userIds: string[]) {
  const user = await requireUser();
  const cId = z.string().uuid().parse(conversationId);
  const parsedUserIds = z.array(z.string().uuid()).parse(userIds);

  // Check if active user is owner/admin or super_admin
  const [callerParticipant] = await db
    .select()
    .from(chatParticipants)
    .where(
      and(
        eq(chatParticipants.conversationId, cId),
        eq(chatParticipants.userId, user.id)
      )
    )
    .limit(1);

  const isGroupAdmin =
    callerParticipant?.role === "owner" || callerParticipant?.role === "admin";
  if (!isGroupAdmin && user.role !== "super_admin") {
    throw new Error("Only group owners or admins can add participants");
  }

  // Filter out existing participants
  const existingParts = await db
    .select({ userId: chatParticipants.userId })
    .from(chatParticipants)
    .where(eq(chatParticipants.conversationId, cId));

  const existingIds = new Set(existingParts.map((p) => p.userId));
  const newIds = parsedUserIds.filter((id) => !existingIds.has(id));

  if (newIds.length === 0) {
    return { success: true };
  }

  // Insert new participants
  const participantsValues = newIds.map((id) => ({
    conversationId: cId,
    userId: id,
    role: "member" as const,
  }));

  await db.insert(chatParticipants).values(participantsValues);

  await createAuditLog({
    userId: user.id,
    action: "add_group_chat_participants",
    entityType: "chat_conversation",
    entityId: cId,
    description: `Added ${newIds.length} participants to group chat`,
  });

  revalidatePath("/chat");

  return { success: true };
}

export async function removeParticipant(conversationId: string, userId: string) {
  const user = await requireUser();
  const cId = z.string().uuid().parse(conversationId);
  const targetId = z.string().uuid().parse(userId);

  // Check if active user is owner/admin or super_admin
  const [callerParticipant] = await db
    .select()
    .from(chatParticipants)
    .where(
      and(
        eq(chatParticipants.conversationId, cId),
        eq(chatParticipants.userId, user.id)
      )
    )
    .limit(1);

  const isGroupAdmin =
    callerParticipant?.role === "owner" || callerParticipant?.role === "admin";
  if (!isGroupAdmin && user.role !== "super_admin" && user.id !== targetId) {
    throw new Error("Only group owners or admins can remove participants");
  }

  // Remove participant
  await db
    .delete(chatParticipants)
    .where(
      and(
        eq(chatParticipants.conversationId, cId),
        eq(chatParticipants.userId, targetId)
      )
    );

  await createAuditLog({
    userId: user.id,
    action: "remove_group_chat_participant",
    entityType: "chat_conversation",
    entityId: cId,
    description: `Removed participant ${targetId} from group chat`,
  });

  revalidatePath("/chat");

  return { success: true };
}

export async function archiveConversation(conversationId: string) {
  const user = await requireUser();
  const cId = z.string().uuid().parse(conversationId);

  // Check if owner/admin or super_admin
  const [callerParticipant] = await db
    .select()
    .from(chatParticipants)
    .where(
      and(
        eq(chatParticipants.conversationId, cId),
        eq(chatParticipants.userId, user.id)
      )
    )
    .limit(1);

  const isGroupAdmin =
    callerParticipant?.role === "owner" || callerParticipant?.role === "admin";
  if (!isGroupAdmin && user.role !== "super_admin") {
    throw new Error("Only group owners or admins can archive conversations");
  }

  await db
    .update(chatConversations)
    .set({
      isArchived: true,
      updatedAt: new Date(),
    })
    .where(eq(chatConversations.id, cId));

  await createAuditLog({
    userId: user.id,
    action: "archive_group_chat",
    entityType: "chat_conversation",
    entityId: cId,
    description: `Archived chat conversation`,
  });

  revalidatePath("/chat");

  return { success: true };
}

export async function searchChatMessages(query: string) {
  const user = await requireUser();
  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return [];
  }

  // Get conversations the user belongs to
  const userParticipations = await db
    .select({ conversationId: chatParticipants.conversationId })
    .from(chatParticipants)
    .where(eq(chatParticipants.userId, user.id));

  if (userParticipations.length === 0) {
    return [];
  }

  const conversationIds = userParticipations.map((p) => p.conversationId);

  // Search messages limit 20
  return db
    .select({
      id: chatMessages.id,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
      conversationId: chatMessages.conversationId,
      senderId: chatMessages.senderId,
      senderName: users.name,
      conversationName: chatConversations.name,
      conversationType: chatConversations.type,
    })
    .from(chatMessages)
    .innerJoin(chatConversations, eq(chatConversations.id, chatMessages.conversationId))
    .leftJoin(users, eq(users.id, chatMessages.senderId))
    .where(
      and(
        inArray(chatMessages.conversationId, conversationIds),
        ilike(chatMessages.content, `%${trimmed}%`),
        eq(chatMessages.isDeleted, false)
      )
    )
    .orderBy(desc(chatMessages.createdAt))
    .limit(20);
}

export async function togglePinConversation(conversationId: string, pinned: boolean) {
  const user = await requireUser();
  const cId = z.string().uuid().parse(conversationId);

  await db
    .update(chatParticipants)
    .set({ pinned })
    .where(
      and(
        eq(chatParticipants.conversationId, cId),
        eq(chatParticipants.userId, user.id)
      )
    );

  revalidatePath("/chat");
  return { success: true };
}

export async function toggleMuteConversation(conversationId: string, muted: boolean) {
  const user = await requireUser();
  const cId = z.string().uuid().parse(conversationId);

  await db
    .update(chatParticipants)
    .set({ muted })
    .where(
      and(
        eq(chatParticipants.conversationId, cId),
        eq(chatParticipants.userId, user.id)
      )
    );

  revalidatePath("/chat");
  return { success: true };
}
