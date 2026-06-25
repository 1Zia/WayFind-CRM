"use server";

import { count, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  clients,
  expenses as expenseRecords,
  income,
  leads,
  projects,
  tasks,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

async function getDashboardFinanceTotals() {
  try {
    const [incomeRows, expenseRows] = await Promise.all([
      db.select().from(income),
      db.select().from(expenseRecords),
    ]);

    const revenue = incomeRows
      .filter((item) => item.status === "paid")
      .reduce((total, item) => total + item.amount, 0);

    const expenses = expenseRows.reduce(
      (total, item) => total + item.amount,
      0,
    );

    return { revenue, expenses };
  } catch {
    return { revenue: 0, expenses: 0 };
  }
}

async function getDashboardLeadCount() {
  try {
    const [leadsCount] = await db.select({ count: count() }).from(leads);
    return leadsCount.count;
  } catch {
    return 0;
  }
}

export async function getDashboardStats() {
  const user = await requireUser();
  requirePermission(user, "dashboard:view");

  const [clientsCount] = await db.select({ count: count() }).from(clients);

  const [activeProjectsCount] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.status, "active"));

  const [pendingTasksCount] = await db
    .select({ count: count() })
    .from(tasks)
    .where(eq(tasks.status, "todo"));

  const [financeTotals, totalLeads] = await Promise.all([
    getDashboardFinanceTotals(),
    getDashboardLeadCount(),
  ]);

  return {
    totalClients: clientsCount.count,
    totalLeads,
    activeProjects: activeProjectsCount.count,
    pendingTasks: pendingTasksCount.count,
    revenue: financeTotals.revenue,
    expenses: financeTotals.expenses,
  };
}
