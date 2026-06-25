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
