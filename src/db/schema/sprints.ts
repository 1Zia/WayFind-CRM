import { date, index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

export const sprintStatusEnum = pgEnum("sprint_status", [
  "planned",
  "active",
  "completed",
  "archived",
]);

export const sprints = pgTable("sprints", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  status: sprintStatusEnum("status").notNull().default("planned"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("sprints_status_idx").on(table.status),
  createdAtIdx: index("sprints_created_at_idx").on(table.createdAt),
}));
