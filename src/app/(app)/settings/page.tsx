import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await requireUser();
  const isSuperAdmin = user.role === "super_admin";

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage account and system preferences."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Current User / Account">
          <div className="flex items-start gap-4">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt=""
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold text-zinc-600">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-3 text-sm">
              <InfoRow label="Name" value={user.name} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Role" value={formatLabel(user.role)} />
              <InfoRow label="Status" value={formatLabel(user.status)} />
              <InfoRow
                label="Account Created"
                value={formatDate(user.createdAt)}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Role">
          <div className="space-y-4">
            <StatusBadge tone="info">{formatLabel(user.role)}</StatusBadge>
            <p className="text-sm text-zinc-500">
              {isSuperAdmin
                ? "You can manage team roles from Team Users."
                : "Your role is managed by your organization administrator."}
            </p>
            {isSuperAdmin ? (
              <Link
                href="/team/users"
                className="inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Manage team roles
              </Link>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="Status">
          <div className="space-y-4">
            <StatusBadge tone={statusTone(user.status)}>
              {formatLabel(user.status)}
            </StatusBadge>
            <p className="text-sm text-zinc-500">
              {isSuperAdmin
                ? "You can manage user account statuses from Team Users."
                : "Your account status is managed by your organization administrator."}
            </p>
            {isSuperAdmin ? (
              <Link
                href="/team/users"
                className="inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Manage user statuses
              </Link>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="Security">
          <div className="space-y-4">
            <StatusBadge>Managed by Clerk</StatusBadge>
            <p className="text-sm text-zinc-500">
              Password, sessions, and multi-factor authentication are managed
              securely by Clerk.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Theme">
          <div className="space-y-4">
            <StatusBadge tone="warning">Planned</StatusBadge>
            <p className="text-sm text-zinc-500">
              Theme preferences will be available in a later release.
            </p>
          </div>
        </SectionCard>

        {isSuperAdmin ? (
          <SectionCard title="Company Settings">
            <div className="space-y-4">
              <StatusBadge tone="warning">Planned</StatusBadge>
              <p className="text-sm text-zinc-500">
                Company profile, billing defaults, and workspace preferences
                will be configured in a later release.
              </p>
            </div>
          </SectionCard>
        ) : null}
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-medium text-zinc-950">{value}</span>
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
  }).format(value);
}

function statusTone(status: string) {
  if (status === "active") {
    return "success";
  }

  if (status === "suspended") {
    return "danger";
  }

  return "default";
}
