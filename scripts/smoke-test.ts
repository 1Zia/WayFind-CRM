import { config } from "dotenv";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import {
  auditLogs,
  clients,
  documents,
  expenses,
  income,
  invoices,
  leads,
  notifications,
  projects,
  sprints,
  tasks,
  users,
} from "../src/db/schema";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is missing. Add it to .env.local first.");
  process.exit(1);
}

const sql = neon(databaseUrl);
const db = drizzle(sql);

const checks = [
  { name: "users", table: users },
  { name: "clients", table: clients },
  { name: "leads", table: leads },
  { name: "projects", table: projects },
  { name: "tasks", table: tasks },
  { name: "sprints", table: sprints },
  { name: "income", table: income },
  { name: "expenses", table: expenses },
  { name: "invoices", table: invoices },
  { name: "documents", table: documents },
  { name: "notifications", table: notifications },
  { name: "audit_logs", table: auditLogs },
];

async function runSmokeTest() {
  console.log("Running WayFind CRM database smoke test...");

  const failures: string[] = [];

  for (const check of checks) {
    try {
      const [result] = await db.select({ count: count() }).from(check.table);
      console.log(`OK ${check.name}: ${result.count}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${check.name}: ${message}`);
      console.error(`FAIL ${check.name}: ${message}`);
    }
  }

  if (failures.length > 0) {
    console.error("\nSmoke test failed. If a table or column is missing, run:");
    console.error("npm run db:push");
    process.exit(1);
  }

  console.log("\nSmoke test passed. Database tables are reachable.");
}

runSmokeTest().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Smoke test crashed: ${message}`);
  process.exit(1);
});
