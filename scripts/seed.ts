import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

async function main() {
  const [{ db }, schema] = await Promise.all([
    import("../src/db"),
    import("../src/db/schema"),
  ]);
  const {
    clients,
    documents,
    expenses,
    income,
    invoices,
    leads,
    notifications,
    projects,
    tasks,
    users,
  } = schema;

  const admin = await db.query.users.findFirst({
    where: eq(users.role, "super_admin"),
  });

  if (!admin) {
    console.error("No super admin found for seeding.");
    console.error("Sign in with Clerk, run admin:make-super, then run db:seed.");
    process.exit(1);
  }

  const existingClient = await db.query.clients.findFirst({
    where: eq(clients.email, "demo.client@example.com"),
  });
  const [client] = existingClient
    ? await db
      .update(clients)
      .set({
        companyName: "WayFind Demo Client",
        updatedAt: new Date(),
      })
      .where(eq(clients.id, existingClient.id))
      .returning()
    : await db
      .insert(clients)
      .values({
        companyName: "WayFind Demo Client",
        contactPerson: "Demo Contact",
        email: "demo.client@example.com",
        phone: "+92 300 0000000",
        address: "Demo Business Address",
        status: "active",
        notes: "Seeded demo client.",
        createdBy: admin.id,
      })
      .returning();

  const existingLead = await db.query.leads.findFirst({
    where: eq(leads.email, "demo.lead@example.com"),
  });
  const [lead] = existingLead
    ? await db
        .update(leads)
        .set({
          leadName: "Demo Lead",
          company: "Demo Lead Company",
          updatedAt: new Date(),
        })
        .where(eq(leads.id, existingLead.id))
        .returning()
    : await db
        .insert(leads)
        .values({
          leadName: "Demo Lead",
          company: "Demo Lead Company",
          contact: "Demo Lead Contact",
          email: "demo.lead@example.com",
          phone: "+92 300 1111111",
          source: "Demo Seed",
          status: "contacted",
          followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
          notes: "Seeded demo lead.",
          createdBy: admin.id,
        })
        .returning();

  const existingProject = await db.query.projects.findFirst({
    where: eq(projects.name, "WayFind Demo Project"),
  });
  const [project] = existingProject
    ? await db
        .update(projects)
        .set({
          clientId: client.id,
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(projects.id, existingProject.id))
        .returning()
    : await db
        .insert(projects)
        .values({
          clientId: client.id,
          name: "WayFind Demo Project",
          description: "Seeded demo project.",
          budget: 250000,
          startDate: new Date().toISOString().slice(0, 10),
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
          status: "active",
          createdBy: admin.id,
        })
        .returning();

  await upsertTask(db, tasks, {
    title: "Demo discovery call",
    description: "Review project goals with the demo client.",
    projectId: project.id,
    assignedTo: admin.id,
    priority: "high",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    status: "todo",
    createdBy: admin.id,
  });

  await upsertTask(db, tasks, {
    title: "Prepare demo proposal",
    description: "Draft a simple proposal for the seeded project.",
    projectId: project.id,
    assignedTo: admin.id,
    priority: "medium",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    status: "in_progress",
    createdBy: admin.id,
  });

  await upsertIncome(db, income, {
    clientId: client.id,
    projectId: project.id,
    amount: 150000,
    paymentDate: new Date().toISOString().slice(0, 10),
    status: "paid",
    notes: "Seeded demo income.",
    createdBy: admin.id,
  });

  await upsertExpense(db, expenses, {
    title: "Demo Software Subscription",
    category: "software",
    amount: 25000,
    date: new Date().toISOString().slice(0, 10),
    approvedBy: admin.id,
    notes: "Seeded demo expense.",
    createdBy: admin.id,
  });

  const existingInvoice = await db.query.invoices.findFirst({
    where: eq(invoices.invoiceNumber, "WF-DEMO-001"),
  });
  if (existingInvoice) {
    await db
      .update(invoices)
      .set({
        clientId: client.id,
        projectId: project.id,
        amount: 150000,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, existingInvoice.id));
  } else {
    await db.insert(invoices).values({
      clientId: client.id,
      projectId: project.id,
      invoiceNumber: "WF-DEMO-001",
      amount: 150000,
      status: "sent",
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      notes: "Seeded demo invoice.",
      createdBy: admin.id,
    });
  }

  const existingDocument = await db.query.documents.findFirst({
    where: eq(documents.fileName, "demo-proposal.pdf"),
  });
  if (existingDocument) {
    await db
      .update(documents)
      .set({
        clientId: client.id,
        projectId: project.id,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, existingDocument.id));
  } else {
    await db.insert(documents).values({
      fileName: "demo-proposal.pdf",
      fileUrl: "https://example.com/demo-proposal.pdf",
      fileType: "application/pdf",
      fileSize: 128000,
      clientId: client.id,
      projectId: project.id,
      uploadedBy: admin.id,
    });
  }

  const existingNotification = await db.query.notifications.findFirst({
    where: eq(notifications.title, "Demo notification"),
  });
  if (!existingNotification) {
    await db.insert(notifications).values({
      userId: admin.id,
      title: "Demo notification",
      message: "Seed data has been added to WayFind CRM.",
      type: "system",
      isRead: false,
    });
  }

  console.log("Seed completed.");
  console.log(`Demo client: ${client.companyName}`);
  console.log(`Demo lead: ${lead.leadName}`);
  console.log(`Demo project: ${project.name}`);
}

async function upsertTask(db: any, tasks: any, values: any) {
  const existingTask = await db.query.tasks.findFirst({
    where: eq(tasks.title, values.title),
  });

  if (existingTask) {
    await db
      .update(tasks)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(tasks.id, existingTask.id));
    return;
  }

  await db.insert(tasks).values(values);
}

async function upsertIncome(db: any, income: any, values: any) {
  const existingIncome = await db.query.income.findFirst({
    where: eq(income.notes, values.notes),
  });

  if (existingIncome) {
    await db
      .update(income)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(income.id, existingIncome.id));
    return;
  }

  await db.insert(income).values(values);
}

async function upsertExpense(db: any, expenses: any, values: any) {
  const existingExpense = await db.query.expenses.findFirst({
    where: eq(expenses.title, values.title),
  });

  if (existingExpense) {
    await db
      .update(expenses)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(expenses.id, existingExpense.id));
    return;
  }

  await db.insert(expenses).values(values);
}

main().catch((error) => {
  console.error("Seed failed.");
  console.error(error);
  process.exit(1);
});
