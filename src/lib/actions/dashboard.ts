"use server";

import { and, asc, count, desc, eq, gte, inArray, lt, ne } from "drizzle-orm";

import { db } from "@/db";
import {
  auditLogs,
  clients,
  documents,
  expenses as expenseRecords,
  income,
  leads,
  notifications,
  projects,
  sprints,
  tasks,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { logServerError } from "@/lib/errors";
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
  } catch (error) {
    logServerError("dashboard.financeTotals", error);
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
  } catch (error) {
    logServerError("dashboard.count", error);
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
  } catch (error) {
    logServerError("dashboard.activeProjects", error);
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
  } catch (error) {
    logServerError("dashboard.pendingTasks", error);
    return 0;
  }
}

async function getActiveSprintTasksCount(userId: string, canViewAllTasks: boolean) {
  try {
    const activeSprintRows = await db
      .select({ id: sprints.id })
      .from(sprints)
      .where(eq(sprints.status, "active"))
      .limit(10);

    const sprintIds = activeSprintRows.map((sprint) => sprint.id);

    if (sprintIds.length === 0) {
      return 0;
    }

    const [result] = await db
      .select({ count: count() })
      .from(tasks)
      .where(
        canViewAllTasks
          ? inArray(tasks.sprintId, sprintIds)
          : and(
              inArray(tasks.sprintId, sprintIds),
              eq(tasks.assignedTo, userId),
            ),
      );

    return result.count;
  } catch (error) {
    logServerError("dashboard.activeSprintTasks", error);
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
  } catch (error) {
    logServerError("dashboard.unreadNotifications", error);
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
  } catch (error) {
    logServerError("dashboard.recentActivity", error);
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
  } catch (error) {
    logServerError("dashboard.upcomingTasks", error);
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
  } catch (error) {
    logServerError("dashboard.recentProjects", error);
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
  } catch (error) {
    logServerError("dashboard.recentLeads", error);
    return [];
  }
}

async function getProjectNameMap(projectIds: Array<string | null>) {
  const ids = Array.from(
    new Set(projectIds.filter((id): id is string => Boolean(id))),
  );

  if (ids.length === 0) {
    return {};
  }

  try {
    const rows = await db
      .select({
        id: projects.id,
        name: projects.name,
      })
      .from(projects)
      .where(inArray(projects.id, ids));

    return Object.fromEntries(rows.map((project) => [project.id, project.name]));
  } catch (error) {
    logServerError("dashboard.projectNameMap", error);
    return {};
  }
}

async function getEmployeeDashboard(userId: string) {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const startOfWeek = new Date(today);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(today.getDate() - today.getDay());

  try {
    const activeSprintRows = await db
      .select({
        id: sprints.id,
        name: sprints.name,
        startDate: sprints.startDate,
        endDate: sprints.endDate,
      })
      .from(sprints)
      .where(eq(sprints.status, "active"))
      .orderBy(desc(sprints.createdAt))
      .limit(1);

    const activeSprint = activeSprintRows[0] ?? null;

    const [
      pendingAssignedRows,
      overdueRows,
      dueTodayRows,
      completedThisWeekRows,
      activeSprintTotalRows,
      activeSprintCompletedRows,
      activeSprintTasks,
      upcomingTasks,
      recentDocuments,
      unreadNotifications,
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(tasks)
        .where(and(eq(tasks.assignedTo, userId), ne(tasks.status, "done"))),
      db
        .select({ count: count() })
        .from(tasks)
        .where(
          and(
            eq(tasks.assignedTo, userId),
            ne(tasks.status, "done"),
            lt(tasks.dueDate, todayIso),
          ),
        ),
      db
        .select({ count: count() })
        .from(tasks)
        .where(
          and(
            eq(tasks.assignedTo, userId),
            ne(tasks.status, "done"),
            eq(tasks.dueDate, todayIso),
          ),
        ),
      db
        .select({ count: count() })
        .from(tasks)
        .where(
          and(
            eq(tasks.assignedTo, userId),
            eq(tasks.status, "done"),
            gte(tasks.updatedAt, startOfWeek),
          ),
        ),
      activeSprint
        ? db
            .select({ count: count() })
            .from(tasks)
            .where(
              and(eq(tasks.assignedTo, userId), eq(tasks.sprintId, activeSprint.id)),
            )
        : Promise.resolve([{ count: 0 }]),
      activeSprint
        ? db
            .select({ count: count() })
            .from(tasks)
            .where(
              and(
                eq(tasks.assignedTo, userId),
                eq(tasks.sprintId, activeSprint.id),
                eq(tasks.status, "done"),
              ),
            )
        : Promise.resolve([{ count: 0 }]),
      activeSprint
        ? db
            .select({
              id: tasks.id,
              title: tasks.title,
              projectId: tasks.projectId,
              priority: tasks.priority,
              status: tasks.status,
              dueDate: tasks.dueDate,
              estimatePoints: tasks.estimatePoints,
            })
            .from(tasks)
            .where(
              and(eq(tasks.assignedTo, userId), eq(tasks.sprintId, activeSprint.id)),
            )
            .orderBy(asc(tasks.dueDate))
            .limit(5)
        : Promise.resolve([]),
      db
        .select({
          id: tasks.id,
          title: tasks.title,
          projectId: tasks.projectId,
          priority: tasks.priority,
          status: tasks.status,
          dueDate: tasks.dueDate,
        })
        .from(tasks)
        .where(and(eq(tasks.assignedTo, userId), ne(tasks.status, "done")))
        .orderBy(asc(tasks.dueDate))
        .limit(5),
      db
        .select({
          id: documents.id,
          fileName: documents.fileName,
          fileType: documents.fileType,
          createdAt: documents.createdAt,
        })
        .from(documents)
        .where(eq(documents.uploadedBy, userId))
        .orderBy(desc(documents.createdAt))
        .limit(5),
      db
        .select({
          id: notifications.id,
          title: notifications.title,
          message: notifications.message,
          type: notifications.type,
          createdAt: notifications.createdAt,
        })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
        .orderBy(desc(notifications.createdAt))
        .limit(5),
    ]);

    const projectNames = await getProjectNameMap([
      ...activeSprintTasks.map((task) => task.projectId),
      ...upcomingTasks.map((task) => task.projectId),
    ]);

    return {
      summary: {
        pendingAssigned: pendingAssignedRows[0]?.count ?? 0,
        overdue: overdueRows[0]?.count ?? 0,
        dueToday: dueTodayRows[0]?.count ?? 0,
        completedThisWeek: completedThisWeekRows[0]?.count ?? 0,
      },
      activeSprint: activeSprint
        ? {
            ...activeSprint,
            completedTasks: activeSprintCompletedRows[0]?.count ?? 0,
            totalTasks: activeSprintTotalRows[0]?.count ?? 0,
            tasks: activeSprintTasks.map((task) => ({
              ...task,
              projectName: task.projectId
                ? projectNames[task.projectId] ?? "No project"
                : "No project",
            })),
          }
        : null,
      upcomingTasks: upcomingTasks.map((task) => ({
        ...task,
        projectName: task.projectId
          ? projectNames[task.projectId] ?? "No project"
          : "No project",
      })),
      recentDocuments,
      unreadNotifications,
    };
  } catch (error) {
    logServerError("dashboard.employeeDashboard", error);
    return {
      summary: {
        pendingAssigned: 0,
        overdue: 0,
        dueToday: 0,
        completedThisWeek: 0,
      },
      activeSprint: null,
      upcomingTasks: [],
      recentDocuments: [],
      unreadNotifications: [],
    };
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
  const canCreateClient = hasPermission(user, "clients:create");
  const canCreateLead = hasPermission(user, "leads:create");
  const canCreateProject = hasPermission(user, "projects:create");
  const canCreateTask = hasPermission(user, "tasks:create");
  const canCreateFinance = hasPermission(user, "finance:create");

  const [
    totalClients,
    totalLeads,
    activeProjects,
    pendingTasks,
    activeSprintTasks,
    financeTotals,
    unreadNotifications,
    recentActivity,
    upcomingTasks,
    recentProjects,
    recentLeads,
    employeeDashboard,
  ] = await Promise.all([
    getCount(canViewClients, clients),
    getCount(canViewLeads, leads),
    getActiveProjectsCount(canViewProjects),
    canViewTasks ? getPendingTasksCount(user.id, canViewAllTasks) : 0,
    canViewTasks ? getActiveSprintTasksCount(user.id, canViewAllTasks) : 0,
    getDashboardFinanceTotals(canViewFinance),
    getUnreadNotificationCount(user.id),
    getRecentActivity(canViewAuditLogs),
    canViewTasks ? getUpcomingTasks(user.id, canViewAllTasks) : [],
    getRecentProjects(canViewProjects),
    getRecentLeads(canViewLeads),
    user.role === "employee" ? getEmployeeDashboard(user.id) : null,
  ]);

  return {
    permissions: {
      canViewClients,
      canViewLeads,
      canViewProjects,
      canViewTasks,
      canViewFinance,
      canViewAuditLogs,
      canCreateClient,
      canCreateLead,
      canCreateProject,
      canCreateTask,
      canCreateFinance,
    },
    totalClients,
    totalLeads,
    activeProjects,
    pendingTasks,
    activeSprintTasks,
    revenue: financeTotals.revenue,
    expenses: financeTotals.expenses,
    profitLoss: financeTotals.profitLoss,
    unreadNotifications,
    recentActivity,
    upcomingTasks,
    recentProjects,
    recentLeads,
    employeeDashboard,
  };
}
