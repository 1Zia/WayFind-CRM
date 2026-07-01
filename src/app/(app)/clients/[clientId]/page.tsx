import Link from "next/link";

import { ClientDeleteButton } from "@/components/clients/client-delete-button";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getClientById, getClientRelatedRecords } from "@/lib/actions/clients";

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

export default async function ClientPage({
  params,
}: {
  params: { clientId: string };
}) {
  const [client, related] = await Promise.all([
    getClientById(params.clientId),
    getClientRelatedRecords(params.clientId),
  ]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {client.companyName}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Client details</p>
        </div>

        <div className="flex gap-2">
          {related.permissions.canUpdateClient ? (
            <Link
              href={`/clients/${client.id}/edit`}
              className="liquid-glass-primary rounded-xl px-4 py-2 text-sm font-semibold text-slate-900 hover:shadow-theme-md"
            >
              Edit
            </Link>
          ) : null}
          {related.permissions.canDeleteClient ? (
            <ClientDeleteButton clientId={client.id} />
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <div className="grid gap-4 text-sm md:grid-cols-2">
          <Detail label="Company" value={client.companyName} />
          <Detail label="Contact" value={client.contactPerson ?? "-"} />
          <Detail label="Email" value={client.email ?? "-"} />
          <Detail label="Phone" value={client.phone ?? "-"} />
          <Detail label="Address" value={client.address ?? "-"} />
          <div>
            <p className="text-zinc-500">Status</p>
            <div className="mt-1">
              <StatusBadge
                tone={client.status === "active" ? "success" : "default"}
              >
                {client.status}
              </StatusBadge>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-zinc-500">Notes</p>
          <div className="mt-1 text-sm">{client.notes ?? "-"}</div>
        </div>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Quick Actions"
          description="Create related work directly from this client."
        >
          <div className="flex flex-wrap gap-2">
            {related.permissions.canCreateProject ? (
              <Link
                href="/projects/new"
                className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-zinc-50"
              >
                New Project
              </Link>
            ) : null}
            {related.permissions.canCreateDocument ? (
              <Link
                href="/documents/new"
                className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-zinc-50"
              >
                Add Document
              </Link>
            ) : null}
            {related.permissions.canCreateInvoice ? (
              <Link
                href="/finance/invoices"
                className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-zinc-50"
              >
                Create Invoice
              </Link>
            ) : null}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard title="Related Projects">
          {related.projects.length > 0 ? (
            <div className="divide-y">
              {related.projects.map((project) => (
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
                  <StatusBadge>{project.status}</StatusBadge>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No related projects"
              description="Create a project to track deadlines, budgets, and tasks for this client."
            />
          )}
        </SectionCard>

        <SectionCard title="Related Documents">
          {related.documents.length > 0 ? (
            <div className="divide-y">
              {related.documents.map((document) => (
                <Link
                  key={document.id}
                  href={`/documents/${document.id}`}
                  className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{document.fileName}</p>
                    <p className="text-xs text-zinc-500">
                      {document.fileType} - {formatDate(document.createdAt)}
                    </p>
                  </div>
                  <span className="text-purple-600">View</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No related documents"
              description="Attach contracts, proposals, invoices, receipts, or requirement docs."
            />
          )}
        </SectionCard>

        {related.permissions.canViewFinance ? (
          <SectionCard title="Recent Income">
            {related.income.length > 0 ? (
              <div className="divide-y">
                {related.income.map((item) => (
                  <Link
                    key={item.id}
                    href="/finance/income"
                    className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{formatMoney(item.amount)}</p>
                      <p className="text-xs text-zinc-500">
                        Payment date {formatDate(item.paymentDate)}
                      </p>
                    </div>
                    <StatusBadge>{item.status}</StatusBadge>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No income recorded"
                description="Paid and pending income for this client will appear here."
              />
            )}
          </SectionCard>
        ) : null}

        {related.permissions.canViewFinance ? (
          <SectionCard title="Recent Invoices">
            {related.invoices.length > 0 ? (
              <div className="divide-y">
                {related.invoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    href="/finance/invoices"
                    className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-zinc-500">
                        Due {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatMoney(invoice.amount)}
                      </p>
                      <StatusBadge>{invoice.status}</StatusBadge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No invoices recorded"
                description="Client invoices will appear here after they are created."
              />
            )}
          </SectionCard>
        ) : null}
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-zinc-500">{label}</p>
      <div className="mt-1 font-medium text-zinc-950">{value}</div>
    </div>
  );
}
