import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getDashboardStats } from "@/lib/actions/dashboard";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: Date | string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  if (stats.employeeDashboard) {
    return <EmployeeDashboard stats={stats.employeeDashboard} />;
  }

  const quickActions = [
    stats.permissions.canCreateClient
      ? { href: "/clients/new", label: "New Client" }
      : null,
    stats.permissions.canCreateLead ? { href: "/leads/new", label: "New Lead" } : null,
    stats.permissions.canCreateProject
      ? { href: "/projects/new", label: "New Project" }
      : null,
    stats.permissions.canCreateTask ? { href: "/tasks/new", label: "New Task" } : null,
    stats.permissions.canCreateFinance
      ? { href: "/finance/invoices", label: "New Invoice" }
      : null,
  ].filter(Boolean) as Array<{ href: string; label: string }>;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your company operations."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.permissions.canViewClients ? (
          <MetricCard title="Total Clients" value={stats.totalClients} />
        ) : null}
        {stats.permissions.canViewLeads ? (
          <MetricCard title="Total Leads" value={stats.totalLeads} />
        ) : null}
        {stats.permissions.canViewProjects ? (
          <MetricCard title="Active Projects" value={stats.activeProjects} />
        ) : null}
        {stats.permissions.canViewTasks ? (
          <MetricCard title="Pending Tasks" value={stats.pendingTasks} />
        ) : null}
        {stats.permissions.canViewTasks ? (
          <MetricCard
            title="Active Sprint Tasks"
            value={stats.activeSprintTasks}
          />
        ) : null}
        {stats.permissions.canViewFinance ? (
          <>
            <MetricCard title="Revenue" value={formatMoney(stats.revenue)} />
            <MetricCard title="Expenses" value={formatMoney(stats.expenses)} />
            <MetricCard
              title="Profit / Loss"
              value={formatMoney(stats.profitLoss)}
            />
          </>
        ) : null}
        <MetricCard
          title="Unread Notifications"
          value={stats.unreadNotifications}
        />
      </div>

      {quickActions.length > 0 ? (
        <div className="mt-6">
          <SectionCard
            title="Quick Actions"
            description="Jump straight into common CRM work."
          >
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {stats.permissions.canViewAuditLogs ? (
          <SectionCard title="Recent Activity">
            {stats.recentActivity.length > 0 ? (
              <div className="divide-y">
                {stats.recentActivity.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-medium">{item.description}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {item.entityType} - {item.action} -{" "}
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent activity"
                description="Audit activity will appear here as records change."
              />
            )}
          </SectionCard>
        ) : null}

        {stats.permissions.canViewTasks ? (
          <SectionCard title="Upcoming Tasks">
            {stats.upcomingTasks.length > 0 ? (
              <div className="divide-y">
                {stats.upcomingTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
                  >
                    <span className="font-medium">{task.title}</span>
                    <span className="text-zinc-500">
                      {formatDate(task.dueDate)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No upcoming tasks"
                description="Open tasks with due dates will appear here."
              />
            )}
          </SectionCard>
        ) : null}

        {stats.permissions.canViewProjects ? (
          <SectionCard title="Recent Projects">
          {stats.recentProjects.length > 0 ? (
            <div className="divide-y">
              {stats.recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-zinc-500">
                      Deadline {formatDate(project.deadline)}
                    </p>
                  </div>
                  <StatusBadge>{project.status.replace("_", " ")}</StatusBadge>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No recent projects"
              description="Projects will appear here after they are created."
            />
          )}
          </SectionCard>
        ) : null}

        {stats.permissions.canViewLeads ? (
          <SectionCard title="Recent Leads">
          {stats.recentLeads.length > 0 ? (
            <div className="divide-y">
              {stats.recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{lead.leadName}</p>
                    <p className="text-xs text-zinc-500">
                      {lead.company ?? "No company"} - Follow-up{" "}
                      {formatDate(lead.followUpDate)}
                    </p>
                  </div>
                  <StatusBadge tone="info">
                    {lead.status.replace("_", " ")}
                  </StatusBadge>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No recent leads"
              description="Leads will appear here after they are created."
            />
          )}
          </SectionCard>
        ) : null}
      </div>
    </>
  );
}

type EmployeeDashboardStats = NonNullable<
  Awaited<ReturnType<typeof getDashboardStats>>["employeeDashboard"]
>;

function EmployeeDashboard({ stats }: { stats: EmployeeDashboardStats }) {
  const activeSprintProgress = stats.activeSprint?.totalTasks
    ? Math.round(
        (stats.activeSprint.completedTasks / stats.activeSprint.totalTasks) *
          100,
      )
    : 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your assigned work, files, and notifications."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Pending Assigned to Me"
          value={stats.summary.pendingAssigned}
        />
        <MetricCard title="Overdue" value={stats.summary.overdue} />
        <MetricCard title="Due Today" value={stats.summary.dueToday} />
        <MetricCard
          title="Completed This Week"
          value={stats.summary.completedThisWeek}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="My Active Sprint"
          description={
            stats.activeSprint
              ? `${stats.activeSprint.completedTasks} of ${stats.activeSprint.totalTasks} tasks complete`
              : "Active sprint work assigned to you will appear here."
          }
        >
          {stats.activeSprint ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stats.activeSprint.name}</span>
                  <span className="text-zinc-500">{activeSprintProgress}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-zinc-100">
                  <div
                    className="h-2 rounded-full bg-purple-600"
                    style={{ width: `${activeSprintProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  {formatDate(stats.activeSprint.startDate)} -{" "}
                  {formatDate(stats.activeSprint.endDate)}
                </p>
              </div>

              {stats.activeSprint.tasks.length > 0 ? (
                <div className="divide-y">
                  {stats.activeSprint.tasks.map((task) => (
                    <TaskLink key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No assigned sprint tasks"
                  description="Tasks assigned to you in the active sprint will appear here."
                />
              )}
            </div>
          ) : (
            <EmptyState
              title="No active sprint"
              description="There is no active sprint assigned to you right now."
            />
          )}
        </SectionCard>

        <SectionCard title="Quick Actions">
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/tasks", label: "View My Tasks" },
              { href: "/documents/new", label: "Upload Document" },
              { href: "/notifications", label: "Open Notifications" },
              { href: "/settings", label: "Update Profile / Settings" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-zinc-50"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Upcoming Tasks">
          {stats.upcomingTasks.length > 0 ? (
            <div className="divide-y">
              {stats.upcomingTasks.map((task) => (
                <TaskLink key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No upcoming tasks"
              description="Assigned tasks with open status will appear here."
            />
          )}
        </SectionCard>

        <SectionCard title="My Documents">
          {stats.recentDocuments.length > 0 ? (
            <div className="divide-y">
              {stats.recentDocuments.map((document) => (
                <Link
                  key={document.id}
                  href={`/documents/${document.id}`}
                  className="block py-3 text-sm first:pt-0 last:pb-0"
                >
                  <p className="font-medium">{document.fileName}</p>
                  <p className="text-xs text-zinc-500">
                    {document.fileType} - {formatDate(document.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No documents yet"
              description="Documents you upload will appear here."
            />
          )}
        </SectionCard>

        <SectionCard title="My Notifications">
          {stats.unreadNotifications.length > 0 ? (
            <div className="divide-y">
              {stats.unreadNotifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={`/notifications/${notification.id}`}
                  className="block py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{notification.title}</p>
                    <StatusBadge tone="info">
                      {notification.type.replace("_", " ")}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {formatDate(notification.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No unread notifications"
              description="New task assignments and alerts will appear here."
            />
          )}
        </SectionCard>
      </div>
    </>
  );
}

function TaskLink({
  task,
}: {
  task: {
    id: string;
    title: string;
    projectName: string;
    priority: string;
    status: string;
    dueDate: string | null;
  };
}) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{task.title}</p>
        <p className="text-xs text-zinc-500">
          {task.projectName} - Due {formatDate(task.dueDate)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge tone="info">{task.priority}</StatusBadge>
        <StatusBadge>{task.status.replace("_", " ")}</StatusBadge>
      </div>
    </Link>
  );
}
