import { requireUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage account and system preferences.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SettingsCard title="Account Information">
          <div className="space-y-3 text-sm">
            <InfoRow label="Name" value={user.name} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="User ID" value={user.id} />
          </div>
        </SettingsCard>

        <SettingsCard title="Current User">
          <div className="space-y-3 text-sm">
            <InfoRow label="Role" value={formatLabel(user.role)} />
            <InfoRow label="Status" value={formatLabel(user.status)} />
            <InfoRow
              label="Joined"
              value={user.createdAt.toLocaleDateString()}
            />
          </div>
        </SettingsCard>

        <SettingsCard title="Role">
          <p className="text-sm text-zinc-500">
            Role changes are managed from Team Users by a super admin.
          </p>
          <button
            disabled
            className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium text-zinc-400"
          >
            Coming soon
          </button>
        </SettingsCard>

        <SettingsCard title="Status">
          <p className="text-sm text-zinc-500">
            Account status is controlled by your organization administrator.
          </p>
          <button
            disabled
            className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium text-zinc-400"
          >
            Coming soon
          </button>
        </SettingsCard>

        <SettingsCard title="Theme">
          <p className="text-sm text-zinc-500">
            Theme preferences will be available in a later release.
          </p>
          <button
            disabled
            className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium text-zinc-400"
          >
            Coming soon
          </button>
        </SettingsCard>

        <SettingsCard title="Security">
          <p className="text-sm text-zinc-500">
            Passwords and multi-factor authentication are managed by Clerk.
          </p>
          <button
            disabled
            className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium text-zinc-400"
          >
            Coming soon
          </button>
        </SettingsCard>

        <SettingsCard title="Company Settings">
          <p className="text-sm text-zinc-500">
            Company profile, billing defaults, and workspace settings are not
            editable yet.
          </p>
          <button
            disabled
            className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium text-zinc-400"
          >
            Coming soon
          </button>
        </SettingsCard>
      </div>
    </>
  );
}

function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-white p-5">
      <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
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
