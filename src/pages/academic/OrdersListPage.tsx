import { useMemo, useState } from "react";
import { RoleLink } from "@/components/shared/RoleLink";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrders } from "@/features/orders/hooks";
import { describeApiError } from "@/lib/api/errors";
import {
  formatDate,
  formatMoney,
  orderStatusLabel,
  toNumber,
} from "@/features/commerce/format";

/**
 * Rows come from GET /orders for the authenticated user. Nothing is
 * hardcoded: references, product names, amounts and statuses are API values.
 * Search filters the loaded page locally — it never calls the admin /search.
 */
const FILTERS = [
  { label: "All", value: "all" },
  { label: "Awaiting payment", value: "awaiting_payment" },
  { label: "Under review", value: "under_review" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
] as const;

const PER_PAGE = 20;

export function OrdersListPage() {
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useOrders(page, PER_PAGE);
  const orders = data?.orders ?? [];
  const pagination = data?.pagination ?? null;
  const totalPages = pagination?.total_pages ?? 1;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = filter === "all" || order.order_status === filter;
      const matchesQuery =
        q.length === 0 ||
        (order.order_number ?? "").toLowerCase().includes(q) ||
        (order.product_name_snapshot ?? "").toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [orders, filter, query]);

  const hasOrders = orders.length > 0;

  return (
    <AppShell>
      <PageHeader
        title="Orders"
        description="Every order placed on your account, with its current status."
        actions={
          <Button asChild>
            <RoleLink to="/services">
              <Plus className="h-4 w-4" strokeWidth={2} />
              New order
            </RoleLink>
          </Button>
        }
      />

      {hasOrders && (
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
              placeholder="Search orders"
              aria-label="Search orders by reference or service"
              className="h-10 pl-9"
            />
          </div>
        </div>
      )}

      <section className="border border-border bg-card">
        {isLoading ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">Loading your orders…</p>
          </div>
        ) : isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">
              Orders could not be loaded
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {describeApiError(error, "Please try again in a moment.")}
            </p>
          </div>
        ) : !hasOrders ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">No orders yet</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
              When you place an order for a service, it will appear here with its
              payment and progress status.
            </p>
            <Button asChild className="mt-5">
              <RoleLink to="/services">
                <Plus className="h-4 w-4" strokeWidth={2} />
                Place your first order
              </RoleLink>
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">No matching orders</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Try a different status or search term.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-left md:table">
              <thead>
                <tr className="border-b border-border">
                  {["Reference", "Service", "Date placed", "Amount", "Status"].map(
                    (heading) => (
                      <th
                        key={heading}
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
                {rows.map((order) => {
                  const status = orderStatusLabel(order.order_status);
                  return (
                    <tr key={order.id} className="transition-colors hover:bg-muted/40">
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-foreground">
                        <RoleLink
                          to="/orders/$orderId"
                          params={{ orderId: String(order.id) }}
                          className="hover:text-primary hover:underline"
                        >
                          {order.order_number}
                        </RoleLink>
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground">
                        {order.product_name_snapshot}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-foreground">
                        {formatMoney(toNumber(order.total_price), order.currency)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge label={status.label} tone={status.tone} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile list */}
            <ul className="divide-y divide-border md:hidden">
              {rows.map((order) => {
                const status = orderStatusLabel(order.order_status);
                return (
                  <li key={order.id}>
                    <RoleLink
                      to="/orders/$orderId"
                      params={{ orderId: String(order.id) }}
                      className="block px-5 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {order.product_name_snapshot}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {order.order_number} · {formatDate(order.created_at)}
                          </p>
                        </div>
                        <StatusBadge label={status.label} tone={status.tone} />
                      </div>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {formatMoney(toNumber(order.total_price), order.currency)}
                      </p>
                    </RoleLink>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      {hasOrders && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Page {pagination?.page ?? page} of {totalPages}
            {pagination?.total ? ` · ${pagination.total} orders` : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
