import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { projects } from "./projects";
import { tasks } from "./tasks";

export const chatConversationTypeEnum = pgEnum("chat_conversation_type", [
  "direct",
  "group",
  "project",
  "task",
]);

export const chatParticipantRoleEnum = pgEnum("chat_participant_role", [
  "owner",
  "admin",
  "member",
]);

export const chatMessageTypeEnum = pgEnum("chat_message_type", [
  "text",
  "file",
  "system",
]);

export const chatConversations = pgTable(
  "chat_conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: chatConversationTypeEnum("type").notNull(),
    name: text("name"),
    description: text("description"),
    projectId: uuid("project_id").references(() => projects.id),
    taskId: uuid("task_id").references(() => tasks.id),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    lastMessageAt: timestamp("last_message_at"),
    isArchived: boolean("is_archived").default(false).notNull(),
  },
  (table) => ({
    typeIdx: index("chat_conv_type_idx").on(table.type),
    projectIdIdx: index("chat_conv_project_id_idx").on(table.projectId),
    taskIdIdx: index("chat_conv_task_id_idx").on(table.taskId),
  })
);

export const chatParticipants = pgTable(
  "chat_participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => chatConversations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: chatParticipantRoleEnum("role").notNull().default("member"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    lastReadAt: timestamp("last_read_at"),
    muted: boolean("muted").default(false).notNull(),
    pinned: boolean("pinned").default(false).notNull(),
  },
  (table) => ({
    convUserIdx: index("chat_part_conv_user_idx").on(
      table.conversationId,
      table.userId
    ),
    userIdIdx: index("chat_part_user_idx").on(table.userId),
  })
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => chatConversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    type: chatMessageTypeEnum("type").notNull().default("text"),
    parentMessageId: uuid("parent_message_id"),
    attachmentUrl: text("attachment_url"),
    attachmentName: text("attachment_name"),
    attachmentType: text("attachment_type"),
    attachmentSize: integer("attachment_size"),
    isEdited: boolean("is_edited").default(false).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    convIdx: index("chat_msg_conv_idx").on(table.conversationId),
    senderIdx: index("chat_msg_sender_idx").on(table.senderId),
    createdAtIdx: index("chat_msg_created_at_idx").on(table.createdAt),
  })
);

export const chatReactions = pgTable(
  "chat_reactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    messageId: uuid("message_id")
      .notNull()
      .references(() => chatMessages.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    emoji: text("emoji").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    messageIdx: index("chat_react_msg_idx").on(table.messageId),
    userIdIdx: index("chat_react_user_idx").on(table.userId),
  })
);
