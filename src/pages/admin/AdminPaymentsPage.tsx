import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";

import { EmptyState } from "@/components/shared/DashboardCard";
import { TableScroll } from "@/components/shared/TableScroll";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatMoney, toFlag, toNumber } from "@/features/commerce/format";
import type { StatusTone } from "@/components/ui/status-badge";
import { useAdminPayments } from "@/features/admin/hooks";
import type { AdminPaymentStatus } from "@/features/admin/api";
import type { Payment } from "@/features/payments/api";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";

const FILTERS: { label: string; value: AdminPaymentStatus }[] = [
  { label: "All", value: "all" },
  { label: "Approved", value: "verified" },
  { label: "Rejected", value: "rejected" },
];

const PER_PAGE = 20;

export function AdminPaymentsPage() {
  const [status, setStatus] = useState<AdminPaymentStatus>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = useAdminPayments({ status, search, page, perPage: PER_PAGE });
  const rows = query.data?.payments ?? [];
  const pagination = query.data?.pagination;
  const hasSearch = search.trim().length > 0;
  const totalPages = Math.max(1, pagination?.total_pages ?? 1);

  useEffect(() => {
    setPage(1);
  }, [status, search]);

  return (
    <AdminLayout>
      <PageHeader title="Payments" description="Review and manage payments submitted by users." />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {FILTERS.map((item) => {
            const active = item.value === status;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setStatus(item.value)}
                className={
                  active
                    ? "whitespace-nowrap border border-primary bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
                    : "whitespace-nowrap border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-80">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.9}
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search payments"
            aria-label="Search payments"
            className="h-10 pl-9"
          />
        </div>
      </div>

      <section className="min-w-0 border border-border bg-card">
        {query.isLoading ? (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground">
            Loading payments...
          </p>
        ) : query.isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">Payments could not be loaded</p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {describeApiError(query.error, "Please try again in a moment.")}
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-16">
            <EmptyState
              message={
                hasSearch ? "No payments match this search." : "No payments found for this status."
              }
            />
          </div>
        ) : (
          <>
            <TableScroll>
              <table className="w-full min-w-[920px] text-left">
                <thead>
                  <tr className="border-b border-border">
                    {["Payment reference", "Order", "Amount", "Submitted", "Status", ""].map(
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
                  {rows.map((payment) => (
                    <PaymentRow
                      key={String(payment.id)}
                      payment={payment}
                      backendAwaitingVerification={false}
                    />
                  ))}
                </tbody>
              </table>
            </TableScroll>

            <ul className="divide-y divide-border md:hidden">
              {rows.map((payment) => {
                const badge = adminPaymentBadge(payment, false);
                return (
                  <li key={String(payment.id)} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {payment.payment_reference}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Order #{payment.order_id} · {paymentAmount(payment)} ·{" "}
                          {formatDate(payment.submitted_at ?? payment.created_at)}
                        </p>
                      </div>
                      <StatusBadge label={badge.label} tone={badge.tone} />
                    </div>
                    <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                      <Link
                        to="/admin/payments/$paymentId"
                        params={{ paymentId: String(payment.id) }}
                      >
                        View details
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

function PaymentRow({
  payment,
  backendAwaitingVerification,
}: {
  payment: Payment;
  backendAwaitingVerification: boolean;
}) {
  const badge = adminPaymentBadge(payment, backendAwaitingVerification);
  return (
    <tr className="transition-colors hover:bg-muted/40">
      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-foreground">
        <Link
          to="/admin/payments/$paymentId"
          params={{ paymentId: String(payment.id) }}
          className="hover:text-primary hover:underline"
        >
          {payment.payment_reference}
        </Link>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
        #{payment.order_id}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-foreground">
        {paymentAmount(payment)}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
        {formatDate(payment.submitted_at ?? payment.created_at)}
      </td>
      <td className="px-5 py-4">
        <StatusBadge label={badge.label} tone={badge.tone} />
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-right">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/payments/$paymentId" params={{ paymentId: String(payment.id) }}>
            View details
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </Button>
      </td>
    </tr>
  );
}

function paymentAmount(payment: Payment) {
  const amount = toNumber(payment.amount_paid);
  return payment.currency ? formatMoney(amount, payment.currency) : amount.toLocaleString();
}

function adminPaymentBadge(
  payment: Payment,
  backendAwaitingVerification = false,
): { label: string; tone: StatusTone } {
  if (payment.payment_status === "verified") return { label: "Approved", tone: "success" };
  if (payment.payment_status === "rejected") return { label: "Rejected", tone: "danger" };

  const reviewableStatus =
    payment.payment_status === "pending" || payment.payment_status === "submitted";
  const hasProof = backendAwaitingVerification || toFlag(payment.has_pop);

  if (reviewableStatus && hasProof) {
    return { label: "Awaiting approval", tone: "info" };
  }
  if (reviewableStatus) return { label: "Pending", tone: "warning" };

  return { label: payment.payment_status || "-", tone: "neutral" };
}
