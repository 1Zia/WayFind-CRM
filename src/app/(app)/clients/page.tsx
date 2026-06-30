import Link from "next/link";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmptyRow,
  DataTableHead,
  DataTableHeadCell,
  DataTableRow,
  DataTableWrapper,
} from "@/components/shared/data-table-wrapper";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ForbiddenState } from "@/components/shared/forbidden-state";
import { getClients } from "@/lib/actions/clients";
import { requireUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { LiquidButton } from "@/components/ui/button";

export default async function ClientsPage() {
  let clients;
  let user;

  try {
    [clients, user] = await Promise.all([getClients(), requireUser()]);
  } catch {
    return <ForbiddenState />;
  }

  return (
    <>
      <PageHeader
        title="Clients"
        description="Manage company clients and customer records."
        action={
          hasPermission(user, "clients:create") ? (
            <LiquidButton href="/clients/new" size="default">
              New Client
            </LiquidButton>
          ) : null
        }
      />

      <DataTableWrapper>
        <DataTable>
          <DataTableHead>
            <tr>
              <DataTableHeadCell>Company</DataTableHeadCell>
              <DataTableHeadCell>Contact</DataTableHeadCell>
              <DataTableHeadCell>Email</DataTableHeadCell>
              <DataTableHeadCell>Status</DataTableHeadCell>
              <DataTableHeadCell>Action</DataTableHeadCell>
            </tr>
          </DataTableHead>

          <DataTableBody>
            {clients.map((client) => (
              <DataTableRow key={client.id}>
                <DataTableCell className="font-medium">
                  {client.companyName}
                </DataTableCell>
                <DataTableCell>{client.contactPerson || "-"}</DataTableCell>
                <DataTableCell>{client.email || "-"}</DataTableCell>
                <DataTableCell>
                  <StatusBadge tone="primary">{client.status}</StatusBadge>
                </DataTableCell>
                <DataTableCell>
                  <Link
                    href={`/clients/${client.id}`}
                    className="crm-action-link"
                  >
                    View
                  </Link>
                </DataTableCell>
              </DataTableRow>
            ))}

            {clients.length === 0 ? (
              <DataTableEmptyRow colSpan={5}>
                <EmptyState
                  compact
                  title="No clients yet"
                  description="Client records will appear here after they are created."
                  action={
                    hasPermission(user, "clients:create")
                      ? { label: "New Client", href: "/clients/new" }
                      : undefined
                  }
                />
              </DataTableEmptyRow>
            ) : null}
          </DataTableBody>
        </DataTable>
      </DataTableWrapper>
    </>
  );
}
