import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

export const leadStatusEnum = pgEnum("lead_status", [
  "new_lead",
  "contacted",
  "proposal",
  "converted",
  "lost",
]);

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadName: text("lead_name").notNull(),
  company: text("company"),
  contact: text("contact"),
  email: text("email"),
  phone: text("phone"),
  source: text("source"),
  status: leadStatusEnum("status").notNull().default("new_lead"),
  followUpDate: text("follow_up_date"),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
