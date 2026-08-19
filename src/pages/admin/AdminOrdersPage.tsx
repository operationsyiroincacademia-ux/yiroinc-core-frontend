import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/DashboardCard";
import { TableScroll } from "@/components/shared/TableScroll";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusTone } from "@/components/ui/status-badge";
import { formatDate, formatMoney, humaniseStatus, toNumber } from "@/features/commerce/format";
import { useAdminOrders } from "@/features/admin/hooks";
import type { AdminOrderStatus } from "@/features/admin/api";
import type { Order } from "@/features/orders/api";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";

const FILTERS: { label: string; value: AdminOrderStatus }[] = [
  { label: "All", value: "all" },
  { label: "Awaiting payment", value: "awaiting_payment" },
  { label: "Paid", value: "paid" },
  { label: "Completed", value: "completed" },
];

const PER_PAGE = 20;

export function AdminOrdersPage() {
  const [status, setStatus] = useState<AdminOrderStatus>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = useAdminOrders({ status, search, page, perPage: PER_PAGE });
  const rows = query.data?.orders ?? [];
  const pagination = query.data?.pagination;
  const totalPages = Math.max(1, pagination?.total_pages ?? 1);

  useEffect(() => {
    setPage(1);
  }, [status, search]);

  return (
    <AdminLayout>
      <PageHeader title="Orders" description="Review and manage customer orders." />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
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

        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search orders"
            aria-label="Search orders"
            className="h-10 pl-9"
          />
        </div>
      </div>

      <section className="min-w-0 border border-border bg-card">
        {query.isLoading ? (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground">Loading orders...</p>
        ) : query.isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">Orders could not be loaded</p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {describeApiError(query.error, "Please try again in a moment.")}
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-16">
            <EmptyState
              message={search.trim() ? "No orders match this search." : "No orders found."}
            />
          </div>
        ) : (
          <>
            <TableScroll>
              <table className="w-full min-w-[980px] text-left">
                <thead>
                  <tr className="border-b border-border">
                    {["Order", "Customer", "Item/Product", "Total", "Order status", "Date", ""].map(
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
                  {rows.map((order) => (
                    <OrderRow key={String(order.id)} order={order} />
                  ))}
                </tbody>
              </table>
            </TableScroll>
            <ul className="divide-y divide-border md:hidden">
              {rows.map((order) => (
                <li key={String(order.id)} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{orderNumber(order)}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {order.product_name_snapshot} · {orderTotal(order)} ·{" "}
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <StatusBadge {...adminOrderStatusBadge(order.admin_order_status)} />
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                    <Link to="/admin/orders/$orderId" params={{ orderId: String(order.id) }}>
                      View details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </li>
              ))}
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

function OrderRow({ order }: { order: Order }) {
  return (
    <tr className="transition-colors hover:bg-muted/40">
      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-foreground">
        <Link
          to="/admin/orders/$orderId"
          params={{ orderId: String(order.id) }}
          className="hover:text-primary hover:underline"
        >
          {orderNumber(order)}
        </Link>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
        <CustomerCell
          record={order as unknown as Record<string, unknown>}
          fallbackId={order.user_id}
        />
      </td>
      <td className="px-5 py-4 text-sm text-foreground">{order.product_name_snapshot}</td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-foreground">{orderTotal(order)}</td>
      <td className="px-5 py-4">
        <StatusBadge {...adminOrderStatusBadge(order.admin_order_status)} />
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
        {formatDate(order.created_at)}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-right">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/orders/$orderId" params={{ orderId: String(order.id) }}>
            View details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </td>
    </tr>
  );
}

function orderNumber(order: Order) {
  return order.order_number || `#${order.id}`;
}

function CustomerCell({
  record,
  fallbackId,
}: {
  record: Record<string, unknown>;
  fallbackId?: string | number;
}) {
  const name = firstString(
    record.customer_display_name,
    record.customer_name,
    record.display_name,
    record.name,
    record.full_name,
  );
  const email = firstString(record.customer_email, record.email, record.user_email);
  if (!name && !email) return <>{fallbackId ? `#${fallbackId}` : "-"}</>;
  return (
    <span className="block min-w-0">
      {name && <span className="block font-medium text-foreground">{name}</span>}
      {email && <span className="block text-xs text-muted-foreground">{email}</span>}
    </span>
  );
}

function firstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string" && value.trim() !== "");
}

function orderTotal(order: Order) {
  return order.currency
    ? formatMoney(toNumber(order.total_price), order.currency)
    : toNumber(order.total_price).toLocaleString();
}

function adminOrderStatusBadge(status: string | null | undefined): {
  label: string;
  tone: StatusTone;
} {
  if (status === "paid") return { label: "Paid", tone: "success" };
  if (status === "completed") return { label: "Completed", tone: "success" };
  if (status === "awaiting_payment") return { label: "Awaiting payment", tone: "warning" };
  return { label: status ? humaniseStatus(status) : "-", tone: "neutral" };
}
