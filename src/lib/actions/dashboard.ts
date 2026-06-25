"use server";

import { and, count, desc, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import {
  auditLogs,
  clients,
  expenses as expenseRecords,
  income,
  leads,
  notifications,
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

    return { revenue, expenses, profitLoss: revenue - expenses };
  } catch {
    return { revenue: 0, expenses: 0, profitLoss: 0 };
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

async function getUnreadNotificationCount(userId: string) {
  try {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
      );

    return result.count;
  } catch {
    return 0;
  }
}

async function getRecentActivity() {
  try {
    return db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        description: auditLogs.description,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(5);
  } catch {
    return [];
  }
}

async function getUpcomingTasks(userId: string, isEmployee: boolean) {
  try {
    const query = db
      .select({
        id: tasks.id,
        title: tasks.title,
        dueDate: tasks.dueDate,
        status: tasks.status,
      })
      .from(tasks)
      .where(
        isEmployee
          ? and(eq(tasks.assignedTo, userId), ne(tasks.status, "done"))
          : ne(tasks.status, "done"),
      )
      .orderBy(desc(tasks.dueDate))
      .limit(5);

    return query;
  } catch {
    return [];
  }
}

async function getRecentProjects() {
  try {
    return db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        deadline: projects.deadline,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .orderBy(desc(projects.createdAt))
      .limit(5);
  } catch {
    return [];
  }
}

async function getRecentLeads() {
  try {
    return db
      .select({
        id: leads.id,
        leadName: leads.leadName,
        company: leads.company,
        status: leads.status,
        followUpDate: leads.followUpDate,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .orderBy(desc(leads.createdAt))
      .limit(5);
  } catch {
    return [];
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

  const [
    financeTotals,
    totalLeads,
    unreadNotifications,
    recentActivity,
    upcomingTasks,
    recentProjects,
    recentLeads,
  ] = await Promise.all([
    getDashboardFinanceTotals(),
    getDashboardLeadCount(),
    getUnreadNotificationCount(user.id),
    getRecentActivity(),
    getUpcomingTasks(user.id, user.role === "employee"),
    getRecentProjects(),
    getRecentLeads(),
  ]);

  return {
    totalClients: clientsCount.count,
    totalLeads,
    activeProjects: activeProjectsCount.count,
    pendingTasks: pendingTasksCount.count,
    revenue: financeTotals.revenue,
    expenses: financeTotals.expenses,
    profitLoss: financeTotals.profitLoss,
    unreadNotifications,
    recentActivity,
    upcomingTasks,
    recentProjects,
    recentLeads,
  };
}
