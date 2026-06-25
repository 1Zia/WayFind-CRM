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
import { hasPermission, requirePermission } from "@/lib/permissions";

async function getDashboardFinanceTotals(enabled: boolean) {
  if (!enabled) {
    return { revenue: 0, expenses: 0, profitLoss: 0 };
  }

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

async function getCount(enabled: boolean, table: typeof clients | typeof leads) {
  if (!enabled) {
    return 0;
  }

  try {
    const [result] = await db.select({ count: count() }).from(table);
    return result.count;
  } catch {
    return 0;
  }
}

async function getActiveProjectsCount(enabled: boolean) {
  if (!enabled) {
    return 0;
  }

  try {
    const [result] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.status, "active"));

    return result.count;
  } catch {
    return 0;
  }
}

async function getPendingTasksCount(userId: string, canViewAllTasks: boolean) {
  try {
    const [result] = await db
      .select({ count: count() })
      .from(tasks)
      .where(
        canViewAllTasks
          ? eq(tasks.status, "todo")
          : and(eq(tasks.status, "todo"), eq(tasks.assignedTo, userId)),
      );

    return result.count;
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

async function getRecentActivity(enabled: boolean) {
  if (!enabled) {
    return [];
  }

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

async function getUpcomingTasks(userId: string, canViewAllTasks: boolean) {
  try {
    return db
      .select({
        id: tasks.id,
        title: tasks.title,
        dueDate: tasks.dueDate,
        status: tasks.status,
      })
      .from(tasks)
      .where(
        canViewAllTasks
          ? ne(tasks.status, "done")
          : and(eq(tasks.assignedTo, userId), ne(tasks.status, "done")),
      )
      .orderBy(desc(tasks.dueDate))
      .limit(5);
  } catch {
    return [];
  }
}

async function getRecentProjects(enabled: boolean) {
  if (!enabled) {
    return [];
  }

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

async function getRecentLeads(enabled: boolean) {
  if (!enabled) {
    return [];
  }

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

  const canViewClients = hasPermission(user, "clients:view");
  const canViewLeads = hasPermission(user, "leads:view");
  const canViewProjects = hasPermission(user, "projects:view");
  const canViewAllTasks = hasPermission(user, "tasks:view");
  const canViewTasks =
    canViewAllTasks || hasPermission(user, "tasks:view_assigned");
  const canViewFinance = hasPermission(user, "finance:view");
  const canViewAuditLogs = user.role === "super_admin";

  const [
    totalClients,
    totalLeads,
    activeProjects,
    pendingTasks,
    financeTotals,
    unreadNotifications,
    recentActivity,
    upcomingTasks,
    recentProjects,
    recentLeads,
  ] = await Promise.all([
    getCount(canViewClients, clients),
    getCount(canViewLeads, leads),
    getActiveProjectsCount(canViewProjects),
    canViewTasks ? getPendingTasksCount(user.id, canViewAllTasks) : 0,
    getDashboardFinanceTotals(canViewFinance),
    getUnreadNotificationCount(user.id),
    getRecentActivity(canViewAuditLogs),
    canViewTasks ? getUpcomingTasks(user.id, canViewAllTasks) : [],
    getRecentProjects(canViewProjects),
    getRecentLeads(canViewLeads),
  ]);

  return {
    permissions: {
      canViewClients,
      canViewLeads,
      canViewProjects,
      canViewTasks,
      canViewFinance,
      canViewAuditLogs,
    },
    totalClients,
    totalLeads,
    activeProjects,
    pendingTasks,
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
