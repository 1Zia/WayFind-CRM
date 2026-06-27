import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { projects } from "./projects";
import { sprints } from "./sprints";
import { users } from "./users";

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "testing",
  "done",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const taskTypeEnum = pgEnum("task_type", [
  "feature",
  "bug",
  "improvement",
  "research",
  "testing",
  "other",
]);

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id),
  sprintId: uuid("sprint_id").references(() => sprints.id),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  type: taskTypeEnum("type").notNull().default("feature"),
  taskCode: text("task_code"),
  estimatePoints: integer("estimate_points").notNull().default(0),
  epic: text("epic"),
  githubLink: text("github_link"),
  dueDate: date("due_date"),
  status: taskStatusEnum("status").notNull().default("todo"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("tasks_status_idx").on(table.status),
  assignedToIdx: index("tasks_assigned_to_idx").on(table.assignedTo),
  projectIdIdx: index("tasks_project_id_idx").on(table.projectId),
  sprintIdIdx: index("tasks_sprint_id_idx").on(table.sprintId),
  dueDateIdx: index("tasks_due_date_idx").on(table.dueDate),
}));
