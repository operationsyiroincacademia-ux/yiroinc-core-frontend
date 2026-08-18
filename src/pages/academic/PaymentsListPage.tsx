import { useMemo, useState } from "react";
import { RoleLink } from "@/components/shared/RoleLink";
import { ArrowRight, Search } from "lucide-react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePayments } from "@/features/payments/hooks";
import { describeApiError } from "@/lib/api/errors";
import {
  formatDate,
  formatMoney,
  paymentBadge,
  toFlag,
  toNumber,
} from "@/features/commerce/format";

/** Rows come from GET /payments for the authenticated user. */
const FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Verified", value: "verified" },
  { label: "Rejected", value: "rejected" },
] as const;

export function PaymentsListPage() {
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const { data, isLoading, isError, error } = usePayments(1, 50);

  const payments = data?.payments;
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (payments ?? []).filter((payment) => {
      const matchesStatus = filter === "all" || payment.payment_status === filter;
      const matchesQuery =
        q.length === 0 ||
        (payment.payment_reference ?? "").toLowerCase().includes(q) ||
        String(payment.order_id).toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [payments, filter, query]);

  const hasPayments = (payments?.length ?? 0) > 0;

  return (
    <AppShell>
      <PageHeader title="Payments" description="Payment records submitted against your orders." />

      {hasPayments && (
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {FILTERS.map((item) => {
              const active = item.value === filter;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
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

          <div className="relative w-full lg:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.9}
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search payments"
              aria-label="Search payments by reference or order"
              className="h-10 pl-9"
            />
          </div>
        </div>
      )}

      <section className="border border-border bg-card">
        {isLoading ? (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground">
            Loading your payments…
          </p>
        ) : isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">Payments could not be loaded</p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {describeApiError(error, "Please try again in a moment.")}
            </p>
          </div>
        ) : !hasPayments ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">No payments yet</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
              Payment records appear here once you submit payment for an order.
            </p>
            <Button asChild className="mt-5">
              <RoleLink to="/orders">View your orders</RoleLink>
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">No matching payments</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Try a different status or search term.
            </p>
          </div>
        ) : (
          <>
            <table className="hidden w-full text-left md:table">
              <thead>
                <tr className="border-b border-border">
                  {["Reference", "Order", "Amount", "Submitted", "Status", ""].map(
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
                {rows.map((payment) => {
                  const badge = paymentBadge(payment.payment_status, toFlag(payment.has_pop));
                  return (
                    <tr key={String(payment.id)} className="transition-colors hover:bg-muted/40">
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-foreground">
                        <RoleLink
                          to="/payments/$paymentId"
                          params={{ paymentId: String(payment.id) }}
                          className="hover:text-primary hover:underline"
                        >
                          {payment.payment_reference}
                        </RoleLink>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                        <RoleLink
                          to="/orders/$orderId"
                          params={{ orderId: String(payment.order_id) }}
                          className="hover:text-primary hover:underline"
                        >
                          #{payment.order_id}
                        </RoleLink>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-foreground">
                        {formatPaymentAmount(payment.amount_paid, payment.currency)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge label={badge.label} tone={badge.tone} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <Button asChild variant="outline" size="sm">
                          <RoleLink
                            to="/payments/$paymentId"
                            params={{ paymentId: String(payment.id) }}
                          >
                            View details
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
              {rows.map((payment) => {
                const badge = paymentBadge(payment.payment_status, toFlag(payment.has_pop));
                return (
                  <li key={String(payment.id)}>
                    <div className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {formatPaymentAmount(payment.amount_paid, payment.currency)}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {payment.payment_reference} · {formatDate(payment.created_at)}
                          </p>
                        </div>
                        <StatusBadge label={badge.label} tone={badge.tone} />
                      </div>
                      <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                        <RoleLink
                          to="/payments/$paymentId"
                          params={{ paymentId: String(payment.id) }}
                        >
                          View details
                          <ArrowRight className="h-4 w-4" strokeWidth={2} />
                        </RoleLink>
                      </Button>
                    </div>
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

function formatPaymentAmount(amount: string | number, currency: string | null | undefined) {
  const value = toNumber(amount);
  return currency ? formatMoney(value, currency) : value.toLocaleString();
}
