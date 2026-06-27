"use server";

import { count } from "drizzle-orm";

import { db } from "@/db";
import {
  clients,
  expenses,
  income,
  invoices,
  leads,
  projects,
  tasks,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { withSafeFallback } from "@/lib/safe-action";

type ReportRole = "super_admin" | "finance_manager" | "project_manager";

function requireReportRole(role: string): ReportRole {
  if (!["super_admin", "finance_manager", "project_manager"].includes(role)) {
    throw new Error("Forbidden");
  }

  return role as ReportRole;
}

function canViewFinance(role: ReportRole) {
  return role === "super_admin" || role === "finance_manager";
}

function canViewOperations(role: ReportRole) {
  return role === "super_admin" || role === "project_manager";
}

function monthKey(date: string) {
  return date.slice(0, 7);
}

function sumByAmount(rows: { amount: number }[]) {
  return rows.reduce((total, row) => total + row.amount, 0);
}

function countValues<T extends string>(values: T[]) {
  return values.reduce<Record<T, number>>((totals, value) => {
    totals[value] = (totals[value] ?? 0) + 1;
    return totals;
  }, {} as Record<T, number>);
}

async function getReportRole() {
  const user = await requireUser();
  return requireReportRole(user.role);
}

async function buildFinanceReport(role: ReportRole) {
  if (!canViewFinance(role)) {
    return null;
  }

  const [incomeRows, expenseRows, invoiceRows] = await Promise.all([
    db
      .select({
        amount: income.amount,
        paymentDate: income.paymentDate,
        status: income.status,
      })
      .from(income),
    db
      .select({
        amount: expenses.amount,
        date: expenses.date,
      })
      .from(expenses),
    db
      .select({
        amount: invoices.amount,
        status: invoices.status,
      })
      .from(invoices),
  ]);

  const totalIncome = sumByAmount(incomeRows);
  const paidIncomeTotal = sumByAmount(
    incomeRows.filter((item) => item.status === "paid"),
  );
  const pendingIncomeTotal = sumByAmount(
    incomeRows.filter((item) => item.status === "pending"),
  );
  const totalExpenses = sumByAmount(expenseRows);
  const unpaidInvoices = sumByAmount(
    invoiceRows.filter(
      (item) => item.status !== "paid" && item.status !== "cancelled",
    ),
  );

  const monthlyIncome = new Map<string, number>();
  const monthlyExpenses = new Map<string, number>();

  for (const item of incomeRows) {
    const month = monthKey(item.paymentDate);
    monthlyIncome.set(month, (monthlyIncome.get(month) ?? 0) + item.amount);
  }

  for (const item of expenseRows) {
    const month = monthKey(item.date);
    monthlyExpenses.set(month, (monthlyExpenses.get(month) ?? 0) + item.amount);
  }

  return {
    totalIncome,
    totalExpenses,
    profitLoss: paidIncomeTotal - totalExpenses,
    unpaidInvoices,
    paidIncomeTotal,
    pendingIncomeTotal,
    monthlyIncome: Array.from(monthlyIncome.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => b.month.localeCompare(a.month)),
    monthlyExpenses: Array.from(monthlyExpenses.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => b.month.localeCompare(a.month)),
  };
}

async function buildProjectReport(role: ReportRole) {
  if (!canViewOperations(role)) {
    return null;
  }

  const projectRows = await db
    .select({
      budget: projects.budget,
      status: projects.status,
    })
    .from(projects);
  const projectsByStatus = countValues(
    projectRows.map((project) => project.status),
  );

  return {
    totalProjects: projectRows.length,
    projectsByStatus,
    activeProjects: projectsByStatus.active ?? 0,
    completedProjects: projectsByStatus.completed ?? 0,
    cancelledProjects: projectsByStatus.cancelled ?? 0,
    totalProjectBudget: projectRows.reduce(
      (total, project) => total + project.budget,
      0,
    ),
  };
}

async function buildTaskReport(role: ReportRole) {
  if (!canViewOperations(role)) {
    return null;
  }

  const taskRows = await db
    .select({
      dueDate: tasks.dueDate,
      priority: tasks.priority,
      status: tasks.status,
    })
    .from(tasks);
  const tasksByStatus = countValues(taskRows.map((task) => task.status));
  const tasksByPriority = countValues(taskRows.map((task) => task.priority));
  const today = new Date().toISOString().slice(0, 10);
  const overdueTasks = taskRows.filter(
    (task) => task.dueDate && task.dueDate < today && task.status !== "done",
  ).length;

  return {
    totalTasks: taskRows.length,
    tasksByStatus,
    tasksByPriority,
    overdueTasks,
    completedTasks: tasksByStatus.done ?? 0,
  };
}

async function buildLeadReport(role: ReportRole) {
  if (!canViewOperations(role)) {
    return null;
  }

  const leadRows = await db
    .select({
      id: leads.id,
      leadName: leads.leadName,
      company: leads.company,
      followUpDate: leads.followUpDate,
      status: leads.status,
    })
    .from(leads);
  const leadsByStatus = countValues(leadRows.map((lead) => lead.status));
  const today = new Date().toISOString().slice(0, 10);
  const upcomingFollowUps = leadRows
    .filter((lead) => lead.followUpDate && lead.followUpDate >= today)
    .sort((a, b) =>
      (a.followUpDate ?? "").localeCompare(b.followUpDate ?? ""),
    )
    .slice(0, 10);

  return {
    totalLeads: leadRows.length,
    leadsByStatus,
    convertedLeads: leadsByStatus.converted ?? 0,
    lostLeads: leadsByStatus.lost ?? 0,
    upcomingFollowUps,
  };
}

function buildBusinessOverviewReport({
  clientCount,
  financeReport,
  leadReport,
  projectReport,
  taskReport,
}: {
  clientCount: number;
  financeReport: Awaited<ReturnType<typeof buildFinanceReport>>;
  leadReport: Awaited<ReturnType<typeof buildLeadReport>>;
  projectReport: Awaited<ReturnType<typeof buildProjectReport>>;
  taskReport: Awaited<ReturnType<typeof buildTaskReport>>;
}) {
  return {
    totalClients: clientCount,
    totalLeads: leadReport?.totalLeads ?? 0,
    convertedLeads: leadReport?.convertedLeads ?? 0,
    activeProjects: projectReport?.activeProjects ?? 0,
    completedProjects: projectReport?.completedProjects ?? 0,
    pendingTasks:
      (taskReport?.tasksByStatus.todo ?? 0) +
      (taskReport?.tasksByStatus.in_progress ?? 0) +
      (taskReport?.tasksByStatus.testing ?? 0),
    completedTasks: taskReport?.completedTasks ?? 0,
    totalIncome: financeReport?.paidIncomeTotal ?? 0,
    totalExpenses: financeReport?.totalExpenses ?? 0,
    profitLoss: financeReport?.profitLoss ?? 0,
  };
}

export async function getFinanceReport() {
  const role = await getReportRole();
  return withSafeFallback("reports.finance", () => buildFinanceReport(role), null);
}

export async function getProjectReport() {
  const role = await getReportRole();
  return withSafeFallback("reports.projects", () => buildProjectReport(role), null);
}

export async function getTaskReport() {
  const role = await getReportRole();
  return withSafeFallback("reports.tasks", () => buildTaskReport(role), null);
}

export async function getLeadReport() {
  const role = await getReportRole();
  return withSafeFallback("reports.leads", () => buildLeadReport(role), null);
}

export async function getBusinessOverviewReport() {
  const role = await getReportRole();
  const [clientCountResult, financeReport, projectReport, taskReport, leadReport] =
    await Promise.all([
      withSafeFallback(
        "reports.overview.clients",
        () => db.select({ count: count() }).from(clients),
        [{ count: 0 }],
      ),
      withSafeFallback("reports.overview.finance", () => buildFinanceReport(role), null),
      withSafeFallback("reports.overview.projects", () => buildProjectReport(role), null),
      withSafeFallback("reports.overview.tasks", () => buildTaskReport(role), null),
      withSafeFallback("reports.overview.leads", () => buildLeadReport(role), null),
    ]);

  return buildBusinessOverviewReport({
    clientCount: clientCountResult[0]?.count ?? 0,
    financeReport,
    leadReport,
    projectReport,
    taskReport,
  });
}

export async function getReportsPageData() {
  const role = await getReportRole();
  const [clientCountResult, financeReport, projectReport, taskReport, leadReport] =
    await Promise.all([
      withSafeFallback(
        "reports.page.clients",
        () => db.select({ count: count() }).from(clients),
        [{ count: 0 }],
      ),
      withSafeFallback("reports.page.finance", () => buildFinanceReport(role), null),
      withSafeFallback("reports.page.projects", () => buildProjectReport(role), null),
      withSafeFallback("reports.page.tasks", () => buildTaskReport(role), null),
      withSafeFallback("reports.page.leads", () => buildLeadReport(role), null),
    ]);
  const overview = buildBusinessOverviewReport({
    clientCount: clientCountResult[0]?.count ?? 0,
    financeReport,
    leadReport,
    projectReport,
    taskReport,
  });

  return {
    overview,
    finance: financeReport,
    project: projectReport,
    task: taskReport,
    lead: leadReport,
  };
}
