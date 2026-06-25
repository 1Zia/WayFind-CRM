"use server";

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

async function getReportUser() {
  const user = await requireUser();
  return {
    ...user,
    role: requireReportRole(user.role),
  };
}

export async function getFinanceReport() {
  const user = await getReportUser();

  if (!canViewFinance(user.role)) {
    return null;
  }

  const [incomeRows, expenseRows, invoiceRows] = await Promise.all([
    db.select().from(income),
    db.select().from(expenses),
    db.select().from(invoices),
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

export async function getProjectReport() {
  const user = await getReportUser();

  if (!canViewOperations(user.role)) {
    return null;
  }

  const projectRows = await db.select().from(projects);
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

export async function getTaskReport() {
  const user = await getReportUser();

  if (!canViewOperations(user.role)) {
    return null;
  }

  const taskRows = await db.select().from(tasks);
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

export async function getLeadReport() {
  const user = await getReportUser();

  if (!canViewOperations(user.role)) {
    return null;
  }

  const leadRows = await db.select().from(leads);
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

export async function getBusinessOverviewReport() {
  const user = await getReportUser();
  const [clientRows, leadReport, projectReport, taskReport, financeReport] =
    await Promise.all([
      db.select().from(clients),
      canViewOperations(user.role) ? getLeadReport() : null,
      canViewOperations(user.role) ? getProjectReport() : null,
      canViewOperations(user.role) ? getTaskReport() : null,
      canViewFinance(user.role) ? getFinanceReport() : null,
    ]);

  return {
    totalClients: clientRows.length,
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
