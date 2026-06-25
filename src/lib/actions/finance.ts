"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { clients, expenses, income, invoices, projects, users } from "@/db/schema";
import { createAuditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import {
  expenseSchema,
  incomeSchema,
  invoiceSchema,
  type ExpenseInput,
  type IncomeInput,
  type InvoiceInput,
} from "@/lib/validations/finance";

const idSchema = z.string().uuid();

function revalidateFinancePaths(id?: string) {
  revalidatePath("/finance");
  revalidatePath("/finance/income");
  revalidatePath("/finance/expenses");
  revalidatePath("/finance/invoices");
  revalidatePath("/finance/reports");

  if (id) {
    revalidatePath(`/finance/${id}`);
  }
}

function nullable(value?: string) {
  return value || null;
}

async function requireFinance(permission: "finance:view" | "finance:create" | "finance:update") {
  const user = await requireUser();
  requirePermission(user, permission);
  return user;
}

export async function getFinanceFormOptions() {
  await requireFinance("finance:view");

  const [clientOptions, projectOptions, userOptions] = await Promise.all([
    db
      .select({
        id: clients.id,
        name: clients.companyName,
      })
      .from(clients)
      .orderBy(desc(clients.createdAt)),
    db
      .select({
        id: projects.id,
        name: projects.name,
      })
      .from(projects)
      .orderBy(desc(projects.createdAt)),
    db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .where(eq(users.status, "active"))
      .orderBy(desc(users.createdAt)),
  ]);

  return {
    clients: clientOptions,
    projects: projectOptions,
    users: userOptions,
  };
}

export async function getFinanceSummary() {
  await requireFinance("finance:view");

  const [incomeRows, expenseRows, invoiceRows] = await Promise.all([
    db.select().from(income),
    db.select().from(expenses),
    db.select().from(invoices),
  ]);

  const totalIncome = incomeRows
    .filter((item) => item.status === "paid")
    .reduce((total, item) => total + item.amount, 0);

  const totalExpenses = expenseRows.reduce(
    (total, item) => total + item.amount,
    0,
  );

  const unpaidInvoices = invoiceRows
    .filter((item) => item.status !== "paid" && item.status !== "cancelled")
    .reduce((total, item) => total + item.amount, 0);

  return {
    totalIncome,
    totalExpenses,
    profitLoss: totalIncome - totalExpenses,
    unpaidInvoices,
  };
}

export async function getFinanceReports() {
  await requireFinance("finance:view");

  const [incomeRows, expenseRows, projectRows] = await Promise.all([
    db.select().from(income),
    db.select().from(expenses),
    db
      .select({
        id: projects.id,
        name: projects.name,
      })
      .from(projects),
  ]);

  const projectNames = new Map(
    projectRows.map((project) => [project.id, project.name]),
  );
  const monthlyTotals = new Map<
    string,
    {
      month: string;
      income: number;
      expenses: number;
      profitLoss: number;
    }
  >();
  const projectRevenue = new Map<
    string,
    {
      projectId: string;
      projectName: string;
      revenue: number;
    }
  >();

  for (const item of incomeRows) {
    const month = item.paymentDate.slice(0, 7);
    const current = monthlyTotals.get(month) ?? {
      month,
      income: 0,
      expenses: 0,
      profitLoss: 0,
    };

    if (item.status === "paid") {
      current.income += item.amount;

      if (item.projectId) {
        const currentProject = projectRevenue.get(item.projectId) ?? {
          projectId: item.projectId,
          projectName: projectNames.get(item.projectId) ?? item.projectId,
          revenue: 0,
        };

        currentProject.revenue += item.amount;
        projectRevenue.set(item.projectId, currentProject);
      }
    }

    current.profitLoss = current.income - current.expenses;
    monthlyTotals.set(month, current);
  }

  for (const item of expenseRows) {
    const month = item.date.slice(0, 7);
    const current = monthlyTotals.get(month) ?? {
      month,
      income: 0,
      expenses: 0,
      profitLoss: 0,
    };

    current.expenses += item.amount;
    current.profitLoss = current.income - current.expenses;
    monthlyTotals.set(month, current);
  }

  return {
    monthlyTotals: Array.from(monthlyTotals.values()).sort((a, b) =>
      b.month.localeCompare(a.month),
    ),
    projectRevenue: Array.from(projectRevenue.values()).sort(
      (a, b) => b.revenue - a.revenue,
    ),
  };
}

export async function getIncome() {
  await requireFinance("finance:view");

  return db.select().from(income).orderBy(desc(income.paymentDate));
}

export async function createIncome(input: IncomeInput) {
  const user = await requireFinance("finance:create");
  const data = incomeSchema.parse(input);

  const [record] = await db
    .insert(income)
    .values({
      clientId: nullable(data.clientId),
      projectId: nullable(data.projectId),
      amount: data.amount,
      paymentDate: data.paymentDate,
      status: data.status,
      notes: data.notes,
      createdBy: user.id,
    })
    .returning();

  await createAuditLog({
    userId: user.id,
    action: "create",
    entityType: "income",
    entityId: record.id,
    description: `Created income record ${record.id}`,
  });

  revalidateFinancePaths(record.id);

  return {
    success: true,
    data: record,
  };
}

export async function updateIncome(id: string, input: IncomeInput) {
  const user = await requireFinance("finance:update");
  const incomeId = idSchema.parse(id);
  const data = incomeSchema.parse(input);

  const [record] = await db
    .update(income)
    .set({
      clientId: nullable(data.clientId),
      projectId: nullable(data.projectId),
      amount: data.amount,
      paymentDate: data.paymentDate,
      status: data.status,
      notes: data.notes,
      updatedAt: new Date(),
    })
    .where(eq(income.id, incomeId))
    .returning();

  if (!record) {
    throw new Error("Income record not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "update",
    entityType: "income",
    entityId: record.id,
    description: `Updated income record ${record.id}`,
  });

  revalidateFinancePaths(record.id);

  return {
    success: true,
    data: record,
  };
}

export async function getExpenses() {
  await requireFinance("finance:view");

  return db.select().from(expenses).orderBy(desc(expenses.date));
}

export async function createExpense(input: ExpenseInput) {
  const user = await requireFinance("finance:create");
  const data = expenseSchema.parse(input);

  const [record] = await db
    .insert(expenses)
    .values({
      title: data.title,
      category: data.category,
      amount: data.amount,
      date: data.date,
      approvedBy: nullable(data.approvedBy),
      notes: data.notes,
      createdBy: user.id,
    })
    .returning();

  await createAuditLog({
    userId: user.id,
    action: "create",
    entityType: "expense",
    entityId: record.id,
    description: `Created expense ${record.title}`,
  });

  revalidateFinancePaths(record.id);

  return {
    success: true,
    data: record,
  };
}

export async function updateExpense(id: string, input: ExpenseInput) {
  const user = await requireFinance("finance:update");
  const expenseId = idSchema.parse(id);
  const data = expenseSchema.parse(input);

  const [record] = await db
    .update(expenses)
    .set({
      title: data.title,
      category: data.category,
      amount: data.amount,
      date: data.date,
      approvedBy: nullable(data.approvedBy),
      notes: data.notes,
      updatedAt: new Date(),
    })
    .where(eq(expenses.id, expenseId))
    .returning();

  if (!record) {
    throw new Error("Expense not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "update",
    entityType: "expense",
    entityId: record.id,
    description: `Updated expense ${record.title}`,
  });

  revalidateFinancePaths(record.id);

  return {
    success: true,
    data: record,
  };
}

export async function getInvoices() {
  await requireFinance("finance:view");

  return db.select().from(invoices).orderBy(desc(invoices.issueDate));
}

export async function createInvoice(input: InvoiceInput) {
  const user = await requireFinance("finance:create");
  const data = invoiceSchema.parse(input);

  const [record] = await db
    .insert(invoices)
    .values({
      clientId: nullable(data.clientId),
      projectId: nullable(data.projectId),
      invoiceNumber: data.invoiceNumber,
      amount: data.amount,
      status: data.status,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      paidAt: nullable(data.paidAt),
      notes: data.notes,
      createdBy: user.id,
    })
    .returning();

  await createAuditLog({
    userId: user.id,
    action: "create",
    entityType: "invoice",
    entityId: record.id,
    description: `Created invoice ${record.invoiceNumber}`,
  });

  revalidateFinancePaths(record.id);

  return {
    success: true,
    data: record,
  };
}

export async function updateInvoice(id: string, input: InvoiceInput) {
  const user = await requireFinance("finance:update");
  const invoiceId = idSchema.parse(id);
  const data = invoiceSchema.parse(input);

  const [record] = await db
    .update(invoices)
    .set({
      clientId: nullable(data.clientId),
      projectId: nullable(data.projectId),
      invoiceNumber: data.invoiceNumber,
      amount: data.amount,
      status: data.status,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      paidAt: nullable(data.paidAt),
      notes: data.notes,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId))
    .returning();

  if (!record) {
    throw new Error("Invoice not found");
  }

  await createAuditLog({
    userId: user.id,
    action: "update",
    entityType: "invoice",
    entityId: record.id,
    description: `Updated invoice ${record.invoiceNumber}`,
  });

  revalidateFinancePaths(record.id);

  return {
    success: true,
    data: record,
  };
}
