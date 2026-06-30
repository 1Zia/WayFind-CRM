import { z } from "zod";

export const createDirectConversationSchema = z.object({
  userId: z.string().uuid(),
});

export const createGroupConversationSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  participantIds: z.array(z.string().uuid()).min(1, "At least one participant is required"),
  projectId: z.string().uuid().optional().nullable().or(z.literal("")),
  taskId: z.string().uuid().optional().nullable().or(z.literal("")),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string(),
  parentMessageId: z.string().uuid().optional().nullable(),
  attachment: z.object({
    url: z.string().url(),
    name: z.string().min(1),
    type: z.string(),
    size: z.number().int().nonnegative(),
  }).optional().nullable(),
}).refine(data => data.content.trim().length > 0 || data.attachment, {
  message: "Message content or attachment is required",
  path: ["content"],
});

export const editMessageSchema = z.object({
  messageId: z.string().uuid(),
  content: z.string().min(1, "Message content cannot be empty"),
});

export const deleteMessageSchema = z.object({
  messageId: z.string().uuid(),
});

export const addReactionSchema = z.object({
  messageId: z.string().uuid(),
  emoji: z.string().min(1, "Emoji is required"),
});

export const removeReactionSchema = z.object({
  messageId: z.string().uuid(),
  emoji: z.string().min(1, "Emoji is required"),
});

export const markConversationAsReadSchema = z.object({
  conversationId: z.string().uuid(),
});

export const updateGroupDetailsSchema = z.object({
  conversationId: z.string().uuid(),
  name: z.string().min(1, "Group name cannot be empty").optional(),
  description: z.string().optional(),
});
