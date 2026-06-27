"use server";

import { and, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import {
  clients,
  documents,
  expenses,
  income,
  invoices,
  leads,
  projects,
  tasks,
  users,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { withSafeFallback } from "@/lib/safe-action";

export type SearchScope =
  | "all"
  | "clients"
  | "leads"
  | "projects"
  | "tasks"
  | "finance"
  | "files"
  | "people"
  | "docs";

export type SearchResultType =
  | "client"
  | "lead"
  | "project"
  | "task"
  | "document"
  | "finance"
  | "person";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  badge: string;
  status?: string;
  metadata?: string;
  href: string;
};

export type SearchResultGroup = {
  type: SearchResultType;
  label: string;
  results: SearchResult[];
};

export type GlobalSearchResponse = {
  groups: SearchResultGroup[];
  total: number;
};

const LIMIT_PER_GROUP = 5;
const expenseCategories = [
  "salary",
  "rent",
  "software",
  "marketing",
  "travel",
  "utilities",
  "miscellaneous",
] as const;

function isScope(scope: SearchScope, scopes: SearchScope[]) {
  return scope === "all" || scopes.includes(scope);
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return undefined;
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function compactSubtitle(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" · ") || undefined;
}

function isExpenseCategory(
  value: string,
): value is (typeof expenseCategories)[number] {
  return expenseCategories.includes(
    value.toLowerCase() as (typeof expenseCategories)[number],
  );
}

export async function globalSearch(
  rawQuery: string,
  scope: SearchScope = "all",
): Promise<GlobalSearchResponse> {
  const user = await requireUser();
  const query = rawQuery.trim();

  if (query.length < 2) {
    return { groups: [], total: 0 };
  }

  const pattern = `%${query}%`;
  const groups: SearchResultGroup[] = [];

  const canViewClients = hasPermission(user, "clients:view");
  const canViewLeads = hasPermission(user, "leads:view");
  const canViewProjects = hasPermission(user, "projects:view");
  const canViewAllTasks = hasPermission(user, "tasks:view");
  const canViewAssignedTasks = hasPermission(user, "tasks:view_assigned");
  const canViewDocuments = hasPermission(user, "documents:view");
  const canViewFinance = hasPermission(user, "finance:view");
  const canViewPeople = user.role === "super_admin";

  if (canViewClients && isScope(scope, ["clients"])) {
    const rows = await withSafeFallback(
      "search.clients",
      () =>
        db
          .select({
            id: clients.id,
            companyName: clients.companyName,
            contactPerson: clients.contactPerson,
            email: clients.email,
            status: clients.status,
            createdAt: clients.createdAt,
          })
          .from(clients)
          .where(
            or(
              ilike(clients.companyName, pattern),
              ilike(clients.contactPerson, pattern),
              ilike(clients.email, pattern),
              ilike(clients.phone, pattern),
            ),
          )
          .orderBy(desc(clients.createdAt))
          .limit(LIMIT_PER_GROUP),
      [],
    );

    groups.push({
      type: "client",
      label: "Clients",
      results: rows.map((row) => ({
        id: row.id,
        type: "client",
        title: row.companyName,
        subtitle: compactSubtitle([row.contactPerson, row.email]),
        badge: "Client",
        status: row.status,
        metadata: formatDate(row.createdAt),
        href: `/clients/${row.id}`,
      })),
    });
  }

  if (canViewLeads && isScope(scope, ["leads"])) {
    const rows = await withSafeFallback(
      "search.leads",
      () =>
        db
          .select({
            id: leads.id,
            leadName: leads.leadName,
            company: leads.company,
            email: leads.email,
            phone: leads.phone,
            status: leads.status,
            followUpDate: leads.followUpDate,
            createdAt: leads.createdAt,
          })
          .from(leads)
          .where(
            or(
              ilike(leads.leadName, pattern),
              ilike(leads.company, pattern),
              ilike(leads.email, pattern),
              ilike(leads.phone, pattern),
              ilike(leads.source, pattern),
            ),
          )
          .orderBy(desc(leads.createdAt))
          .limit(LIMIT_PER_GROUP),
      [],
    );

    groups.push({
      type: "lead",
      label: "Leads",
      results: rows.map((row) => ({
        id: row.id,
        type: "lead",
        title: row.leadName,
        subtitle: compactSubtitle([row.company, row.email]),
        badge: "Lead",
        status: row.status.replace("_", " "),
        metadata: row.followUpDate
          ? `Follow-up ${formatDate(row.followUpDate)}`
          : formatDate(row.createdAt),
        href: `/leads/${row.id}`,
      })),
    });
  }

  if (canViewProjects && isScope(scope, ["projects"])) {
    const rows = await withSafeFallback(
      "search.projects",
      () =>
        db
          .select({
            id: projects.id,
            name: projects.name,
            description: projects.description,
            status: projects.status,
            budget: projects.budget,
            deadline: projects.deadline,
            createdAt: projects.createdAt,
          })
          .from(projects)
          .where(
            or(
              ilike(projects.name, pattern),
              ilike(projects.description, pattern),
            ),
          )
          .orderBy(desc(projects.createdAt))
          .limit(LIMIT_PER_GROUP),
      [],
    );

    groups.push({
      type: "project",
      label: "Projects",
      results: rows.map((row) => ({
        id: row.id,
        type: "project",
        title: row.name,
        subtitle: row.description ?? undefined,
        badge: "Project",
        status: row.status,
        metadata: compactSubtitle([
          formatMoney(row.budget),
          row.deadline ? `Due ${formatDate(row.deadline)}` : undefined,
        ]),
        href: `/projects/${row.id}`,
      })),
    });
  }

  if ((canViewAllTasks || canViewAssignedTasks) && isScope(scope, ["tasks"])) {
    const searchClause = or(
      ilike(tasks.title, pattern),
      ilike(tasks.description, pattern),
    );
    const ownerClause = canViewAllTasks ? undefined : eq(tasks.assignedTo, user.id);

    const rows = await withSafeFallback(
      "search.tasks",
      () =>
        db
          .select({
            id: tasks.id,
            title: tasks.title,
            description: tasks.description,
            status: tasks.status,
            priority: tasks.priority,
            dueDate: tasks.dueDate,
            createdAt: tasks.createdAt,
          })
          .from(tasks)
          .where(ownerClause ? and(searchClause, ownerClause) : searchClause)
          .orderBy(desc(tasks.createdAt))
          .limit(LIMIT_PER_GROUP),
      [],
    );

    groups.push({
      type: "task",
      label: "Tasks",
      results: rows.map((row) => ({
        id: row.id,
        type: "task",
        title: row.title,
        subtitle: row.description ?? undefined,
        badge: row.priority,
        status: row.status.replace("_", " "),
        metadata: row.dueDate ? `Due ${formatDate(row.dueDate)}` : undefined,
        href: `/tasks/${row.id}`,
      })),
    });
  }

  if (canViewDocuments && isScope(scope, ["files", "docs"])) {
    const rows = await withSafeFallback(
      "search.documents",
      () =>
        db
          .select({
            id: documents.id,
            fileName: documents.fileName,
            fileType: documents.fileType,
            description: documents.description,
            fileSize: documents.fileSize,
            createdAt: documents.createdAt,
          })
          .from(documents)
          .where(
            or(
              ilike(documents.fileName, pattern),
              ilike(documents.fileType, pattern),
              ilike(documents.description, pattern),
            ),
          )
          .orderBy(desc(documents.createdAt))
          .limit(LIMIT_PER_GROUP),
      [],
    );

    groups.push({
      type: "document",
      label: scope === "files" ? "Files" : "Documents",
      results: rows.map((row) => ({
        id: row.id,
        type: "document",
        title: row.fileName,
        subtitle: row.description ?? row.fileType,
        badge: "Document",
        metadata: `${row.fileSize} KB`,
        href: `/documents/${row.id}`,
      })),
    });
  }

  if (canViewFinance && isScope(scope, ["finance"])) {
    const normalizedQuery = query.toLowerCase();
    const categoryClause = isExpenseCategory(normalizedQuery)
      ? eq(expenses.category, normalizedQuery)
      : undefined;
    const expenseSearchClause = categoryClause
      ? or(
          ilike(expenses.title, pattern),
          ilike(expenses.notes, pattern),
          categoryClause,
        )
      : or(ilike(expenses.title, pattern), ilike(expenses.notes, pattern));

    const [invoiceRows, incomeRows, expenseRows] = await Promise.all([
      withSafeFallback(
        "search.finance.invoices",
        () =>
          db
            .select({
              id: invoices.id,
              invoiceNumber: invoices.invoiceNumber,
              amount: invoices.amount,
              status: invoices.status,
              dueDate: invoices.dueDate,
              notes: invoices.notes,
              createdAt: invoices.createdAt,
            })
            .from(invoices)
            .where(
              or(
                ilike(invoices.invoiceNumber, pattern),
                ilike(invoices.notes, pattern),
              ),
            )
            .orderBy(desc(invoices.createdAt))
            .limit(3),
        [],
      ),
      withSafeFallback(
        "search.finance.income",
        () =>
          db
            .select({
              id: income.id,
              amount: income.amount,
              status: income.status,
              paymentDate: income.paymentDate,
              notes: income.notes,
              createdAt: income.createdAt,
            })
            .from(income)
            .where(ilike(income.notes, pattern))
            .orderBy(desc(income.createdAt))
            .limit(3),
        [],
      ),
      withSafeFallback(
        "search.finance.expenses",
        () =>
          db
            .select({
              id: expenses.id,
              title: expenses.title,
              category: expenses.category,
              amount: expenses.amount,
              date: expenses.date,
              notes: expenses.notes,
              createdAt: expenses.createdAt,
            })
            .from(expenses)
            .where(expenseSearchClause)
            .orderBy(desc(expenses.createdAt))
            .limit(3),
        [],
      ),
    ]);

    groups.push({
      type: "finance",
      label: "Finance",
      results: [
        ...invoiceRows.map((row) => ({
          id: row.id,
          type: "finance" as const,
          title: `Invoice ${row.invoiceNumber}`,
          subtitle: row.notes ?? undefined,
          badge: "Invoice",
          status: row.status,
          metadata: compactSubtitle([
            formatMoney(row.amount),
            `Due ${formatDate(row.dueDate)}`,
          ]),
          href: "/finance/invoices",
        })),
        ...incomeRows.map((row) => ({
          id: row.id,
          type: "finance" as const,
          title: `Income ${formatMoney(row.amount)}`,
          subtitle: row.notes ?? undefined,
          badge: "Income",
          status: row.status,
          metadata: formatDate(row.paymentDate),
          href: "/finance/income",
        })),
        ...expenseRows.map((row) => ({
          id: row.id,
          type: "finance" as const,
          title: row.title,
          subtitle: row.notes ?? undefined,
          badge: row.category,
          metadata: compactSubtitle([formatMoney(row.amount), formatDate(row.date)]),
          href: "/finance/expenses",
        })),
      ].slice(0, LIMIT_PER_GROUP),
    });
  }

  if (canViewPeople && isScope(scope, ["people"])) {
    const rows = await withSafeFallback(
      "search.people",
      () =>
        db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            status: users.status,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(or(ilike(users.name, pattern), ilike(users.email, pattern)))
          .orderBy(desc(users.createdAt))
          .limit(LIMIT_PER_GROUP),
      [],
    );

    groups.push({
      type: "person",
      label: "People",
      results: rows.map((row) => ({
        id: row.id,
        type: "person",
        title: row.name,
        subtitle: row.email,
        badge: row.role.replace("_", " "),
        status: row.status,
        metadata: formatDate(row.createdAt),
        href: `/team/users/${row.id}`,
      })),
    });
  }

  const nonEmptyGroups = groups.filter((group) => group.results.length > 0);

  return {
    groups: nonEmptyGroups,
    total: nonEmptyGroups.reduce(
      (total, group) => total + group.results.length,
      0,
    ),
  };
}
