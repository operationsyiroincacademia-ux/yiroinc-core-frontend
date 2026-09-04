import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { EmptyState } from "@/components/shared/DashboardCard";
import { TableLoading } from "@/components/shared/LoadingState";
import { TableScroll } from "@/components/shared/TableScroll";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { AdminSupportStatus, AdminSupportTicket } from "@/features/admin/api";
import { useAdminSupportTickets } from "@/features/admin/hooks";
import { adminSupportStatusBadge, supportCategoryLabel } from "@/features/support/format";
import { formatDateTime } from "@/features/commerce/format";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";

const FILTERS: { label: string; value: AdminSupportStatus }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Resolved", value: "resolved" },
];

const PER_PAGE = 20;

export function AdminSupportPage() {
  const [status, setStatus] = useState<AdminSupportStatus>("all");
  const [page, setPage] = useState(1);
  const query = useAdminSupportTickets({ status, page, perPage: PER_PAGE });
  const rows = query.data?.tickets ?? [];
  const pagination = query.data?.pagination;
  const totalPages = Math.max(1, pagination?.total_pages ?? 1);

  useEffect(() => {
    setPage(1);
  }, [status]);

  return (
    <AdminLayout>
      <PageHeader title="Support" description="Review and respond to customer support tickets." />

      <div className="mb-5 -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setStatus(item.value)}
            className={
              item.value === status
                ? "whitespace-nowrap border border-primary bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
                : "whitespace-nowrap border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="min-w-0 border border-border bg-card">
        {query.isLoading ? (
          <TableLoading columns={5} minWidthClassName="min-w-[920px]" />
        ) : query.isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">
              Support tickets could not be loaded
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {describeApiError(query.error, "Please try again in a moment.")}
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-16">
            <EmptyState message="No support tickets found." />
          </div>
        ) : (
          <>
            <TableScroll>
              <table className="w-full min-w-[920px] text-left">
                <thead>
                  <tr className="border-b border-border">
                    {["Ticket / Subject", "User", "Category", "Status", "Last activity", ""].map(
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
                  {rows.map((ticket) => (
                    <SupportTicketRow key={String(ticket.id)} ticket={ticket} />
                  ))}
                </tbody>
              </table>
            </TableScroll>
            <ul className="divide-y divide-border md:hidden">
              {rows.map((ticket) => {
                const badge = adminSupportStatusBadge(ticket.status);
                return (
                  <li
                    key={String(ticket.id)}
                    className={
                      ticket.status === "open" ? "border-l-2 border-l-info px-5 py-4" : "px-5 py-4"
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {ticket.subject}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {customerName(ticket)} · {supportCategoryLabel(ticket.category)} ·{" "}
                          {formatDateTime(lastActivity(ticket))}
                        </p>
                      </div>
                      <StatusBadge label={badge.label} tone={badge.tone} />
                    </div>
                    <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                      <Link to="/admin/support/$ticketId" params={{ ticketId: String(ticket.id) }}>
                        View ticket
                        <ArrowRight className="h-4 w-4" strokeWidth={2} />
                      </Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      {!query.isLoading && !query.isError && rows.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Page {pagination?.page ?? page} of {totalPages}
            {pagination ? ` · ${pagination.total} total` : ""}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function SupportTicketRow({ ticket }: { ticket: AdminSupportTicket }) {
  const badge = adminSupportStatusBadge(ticket.status);
  return (
    <tr
      className={
        ticket.status === "open"
          ? "border-l-2 border-l-info bg-info-soft/25 transition-colors hover:bg-info-soft/40"
          : "transition-colors hover:bg-muted/40"
      }
    >
      <td className="px-5 py-4 text-sm font-semibold text-foreground">
        <Link
          to="/admin/support/$ticketId"
          params={{ ticketId: String(ticket.id) }}
          className="line-clamp-2 hover:text-primary hover:underline"
        >
          {ticket.subject}
        </Link>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
        {customerName(ticket)}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
        {supportCategoryLabel(ticket.category)}
      </td>
      <td className="px-5 py-4">
        <StatusBadge label={badge.label} tone={badge.tone} />
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
        {formatDateTime(lastActivity(ticket))}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-right">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/support/$ticketId" params={{ ticketId: String(ticket.id) }}>
            View ticket
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </Button>
      </td>
    </tr>
  );
}

function customerName(ticket: AdminSupportTicket) {
  const customer = customerRecord(ticket);
  const direct =
    ticket.user_name ?? ticket.customer_name ?? ticket.name ?? stringValue(customer.display_name);
  const first = stringValue(customer.first_name);
  const last = stringValue(customer.last_name);
  const combined = [first, last].filter(Boolean).join(" ");
  return ((direct ?? combined) || ticket.user_email) ?? ticket.customer_email ?? "Customer";
}

function customerRecord(ticket: AdminSupportTicket) {
  const record = ticket.customer ?? ticket.user;
  return record && typeof record === "object" ? (record as Record<string, unknown>) : {};
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function lastActivity(ticket: AdminSupportTicket) {
  return ticket.last_message_at ?? ticket.updated_at ?? ticket.created_at;
}
