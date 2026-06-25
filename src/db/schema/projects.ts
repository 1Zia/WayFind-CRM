import {
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { clients } from "./clients";
import { users } from "./users";

export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "active",
  "review",
  "completed",
  "cancelled",
]);

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").references(() => clients.id),
  name: text("name").notNull(),
  description: text("description"),
  budget: integer("budget").notNull().default(0),
  startDate: date("start_date"),
  deadline: date("deadline"),
  status: projectStatusEnum("status").notNull().default("planning"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
