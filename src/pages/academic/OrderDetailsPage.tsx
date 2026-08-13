import { useParams } from "@tanstack/react-router";
import { RoleLink } from "@/components/shared/RoleLink";
import { ArrowLeft, Upload, CreditCard } from "lucide-react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/features/orders/hooks";
import { usePayments } from "@/features/payments/hooks";
import { describeApiError } from "@/lib/api/errors";
import {
  formatDate,
  formatMoney,
  humaniseStatus,
  orderStatusLabel,
  paymentBadge,
  toFlag,
  toNumber,
} from "@/features/commerce/format";

/**
 * Data sources:
 *   GET /orders/{id} — order summary, statuses, linked payment fields
 *   GET /payments    — payment records, matched to this order by order_id
 * No values are hardcoded. Status transitions are admin-only endpoints and are
 * intentionally absent from this user-facing page.
 */

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-border bg-card">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-sm font-bold tracking-tight text-foreground">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

export function OrderDetailsPage() {
  const { orderId } = useParams({ strict: false }) as { orderId: string };
  const { data: order, isLoading, isError, error } = useOrder(orderId);
  const paymentsQuery = usePayments(1, 50);

  if (isLoading) {
    return (
      <AppShell>
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Loading this order…</p>
        </section>
      </AppShell>
    );
  }

  if (isError || !order) {
    return (
      <AppShell>
        <PageHeader
          title="Order not available"
          description="This order does not exist or is not available on your account."
        />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            {describeApiError(error, "The order you are looking for could not be loaded.")}
          </p>
          <Button asChild variant="outline" className="mt-5">
            <RoleLink to="/orders">Back to orders</RoleLink>
          </Button>
        </section>
      </AppShell>
    );
  }

  const status = orderStatusLabel(order.order_status);
  const currency = order.currency;
  const payments = (paymentsQuery.data?.payments ?? []).filter(
    (payment) => String(payment.order_id) === String(order.id),
  );
  const orderHasProof = toFlag(order.has_pop);
  const orderPaymentBadge = paymentBadge(
    order.related_payment_status ?? order.payment_status,
    orderHasProof,
  );
  const awaitingProof =
    Boolean(order.payment_id) &&
    !orderHasProof &&
    (order.related_payment_status ?? order.payment_status) === "pending";

  return (
    <AppShell>
      <RoleLink
        to="/orders"
        className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to orders
      </RoleLink>

      <PageHeader
        title={order.order_number}
        description={order.product_name_snapshot}
        actions={<StatusBadge label={status.label} tone={status.tone} />}
      />

      {awaitingProof && (
        <section className="mb-6 bg-accent-soft/70 p-5">
          <h2 className="text-sm font-bold tracking-tight text-foreground">
            Next action
          </h2>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 bg-card px-4 py-3">
            <div className="flex min-w-0 items-start gap-3">
              <Upload className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.9} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Upload proof of payment
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatMoney(toNumber(order.total_price), currency)} is awaiting your
                  receipt.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <RoleLink to="/checkout/$orderId" params={{ orderId: String(order.id) }}>
                Upload proof
              </RoleLink>
            </Button>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Order summary">
            <dl className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
              <Field label="Service" value={order.product_name_snapshot} />
              <Field
                label="Amount"
                value={formatMoney(toNumber(order.total_price), currency)}
              />
              <Field label="Quantity" value={String(toNumber(order.quantity))} />
              <Field
                label="Unit price"
                value={formatMoney(toNumber(order.unit_price), currency)}
              />
              <Field label="SKU" value={order.sku_snapshot ?? "—"} />
              <Field label="Date placed" value={formatDate(order.created_at)} />
              <Field label="Last updated" value={formatDate(order.updated_at)} />
              <Field
                label="Fulfilment"
                value={humaniseStatus(order.fulfillment_status)}
              />
              <Field
                label="Payment"
                value={
                  <StatusBadge
                    label={orderPaymentBadge.label}
                    tone={orderPaymentBadge.tone}
                  />
                }
              />
            </dl>
            {order.customer_note && (
              <div className="border-t border-border px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                  Your note
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                  {order.customer_note}
                </p>
              </div>
            )}
          </Panel>

          <Panel
            title="Payments"
            description="Payment records linked to this order."
            action={
              payments.length > 0 ? (
                <RoleLink
                  to="/payments"
                  className="shrink-0 text-xs font-semibold text-primary hover:underline"
                >
                  View all
                </RoleLink>
              ) : undefined
            }
          >
            {paymentsQuery.isLoading ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                Loading payments…
              </p>
            ) : paymentsQuery.isError ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                {describeApiError(
                  paymentsQuery.error,
                  "Payments for this order could not be loaded.",
                )}
              </p>
            ) : payments.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No payment has been recorded for this order yet.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <RoleLink
                    to="/checkout/$orderId"
                    params={{ orderId: String(order.id) }}
                  >
                    <CreditCard className="h-4 w-4" strokeWidth={2} />
                    Submit payment
                  </RoleLink>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {payments.map((payment) => {
                  const hasProof = toFlag(payment.has_pop);
                  const badge = paymentBadge(payment.payment_status, hasProof);
                  return (
                    <li
                      key={String(payment.id)}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {formatMoney(
                            toNumber(payment.amount_paid),
                            payment.currency ?? currency,
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {payment.payment_reference} · Submitted{" "}
                          {formatDate(payment.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge label={badge.label} tone={badge.tone} />
                        <Button asChild variant="outline" size="sm">
                          <RoleLink
                            to="/payments/$paymentId"
                            params={{ paymentId: String(payment.id) }}
                          >
                            View details
                          </RoleLink>
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        <Panel title="Status" description="Current state recorded on this order.">
          <dl className="space-y-5 px-5 py-5">
            <Field label="Order status" value={<StatusBadge label={status.label} tone={status.tone} />} />
            <Field
              label="Payment status"
              value={
                <StatusBadge
                  label={orderPaymentBadge.label}
                  tone={orderPaymentBadge.tone}
                />
              }
            />
            <Field
              label="Fulfilment status"
              value={humaniseStatus(order.fulfillment_status)}
            />
          </dl>
        </Panel>
      </div>
    </AppShell>
  );
}
