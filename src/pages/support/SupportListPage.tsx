import { ArrowRight, LifeBuoy, Plus } from "lucide-react";

import { RoleLink } from "@/components/shared/RoleLink";
import { TableLoading } from "@/components/shared/LoadingState";
import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useSupportTickets } from "@/features/support/hooks";
import { describeApiError } from "@/lib/api/errors";
import { formatDateTime } from "@/features/commerce/format";
import {
  supportCategoryLabel,
  supportStatusBadge,
  supportTicketNumber,
} from "@/features/support/format";

export function SupportListPage() {
  const tickets = useSupportTickets();
  const rows = tickets.data ?? [];

  return (
    <AppShell>
      <PageHeader
        title="Support"
        description="Get help from the YiroInc Academia team."
        actions={
          <Button asChild>
            <RoleLink to="/support/new">
              <Plus className="h-4 w-4" strokeWidth={2} />
              Contact Support
            </RoleLink>
          </Button>
        }
      />

      <section className="border border-border bg-card">
        {tickets.isLoading ? (
          <TableLoading columns={5} />
        ) : tickets.isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">
              Support tickets could not be loaded
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {describeApiError(tickets.error, "Please try again in a moment.")}
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <LifeBuoy className="mx-auto h-7 w-7 text-muted-foreground" strokeWidth={1.8} />
            <p className="mt-4 text-sm font-semibold text-foreground">
              No support conversations yet.
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              Contact the YiroInc Academia team for help with your account, payments, orders,
              resources, tutoring or other services.
            </p>
            <Button asChild className="mt-5">
              <RoleLink to="/support/new">Contact Support</RoleLink>
            </Button>
          </div>
        ) : (
          <>
            <table className="hidden w-full text-left md:table">
              <thead>
                <tr className="border-b border-border">
                  {["Ticket #", "Subject", "Category", "Status", "Last updated", ""].map(
                    (heading, index) => (
                      <th
                        key={heading || `action-${index}`}
                        scope="col"
                        className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((ticket) => {
                  const badge = supportStatusBadge(ticket.status);
                  return (
                    <tr key={String(ticket.id)} className="transition-colors hover:bg-muted/40">
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-foreground">
                        {supportTicketNumber(ticket)}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-foreground">
                        <RoleLink
                          to={`/support/${ticket.id}`}
                          className="hover:text-primary hover:underline"
                        >
                          {ticket.subject}
                        </RoleLink>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                        {supportCategoryLabel(ticket.category)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge label={badge.label} tone={badge.tone} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                        {formatDateTime(
                          ticket.last_message_at ?? ticket.updated_at ?? ticket.created_at,
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <Button asChild variant="outline" size="sm">
                          <RoleLink to={`/support/${ticket.id}`}>
                            View
                            <ArrowRight className="h-4 w-4" strokeWidth={2} />
                          </RoleLink>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <ul className="divide-y divide-border md:hidden">
              {rows.map((ticket) => {
                const badge = supportStatusBadge(ticket.status);
                return (
                  <li key={String(ticket.id)}>
                    <RoleLink to={`/support/${ticket.id}`} className="block px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{ticket.subject}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {supportTicketNumber(ticket)} · {supportCategoryLabel(ticket.category)}{" "}
                            ·{" "}
                            {formatDateTime(
                              ticket.last_message_at ?? ticket.updated_at ?? ticket.created_at,
                            )}
                          </p>
                        </div>
                        <StatusBadge label={badge.label} tone={badge.tone} />
                      </div>
                    </RoleLink>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </AppShell>
  );
}
