import { useParams } from "@tanstack/react-router";
import { RoleLink } from "@/components/shared/RoleLink";
import { ArrowLeft, CheckCircle2, Clock, FileText, XCircle, type LucideIcon } from "lucide-react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { usePayment } from "@/features/payments/hooks";
import { describeApiError } from "@/lib/api/errors";
import {
  formatDateTime,
  formatMoney,
  paymentBadge,
  toFlag,
  toNumber,
} from "@/features/commerce/format";
import type { Payment } from "@/features/payments/api";
import type { PaymentActivity } from "@/features/payments/api";
import { paymentActivityDescription, paymentActivityLabel } from "@/features/payments/activity";

/**
 * Data source: GET /payments/{id}. Payment activity is rendered from the
 * backend activity history in the order returned by the API.
 */

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-border bg-card">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-sm font-bold tracking-tight text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{children}</dd>
    </div>
  );
}

export function PaymentDetailsPage() {
  const { paymentId } = useParams({ strict: false }) as { paymentId: string };
  const { data, isLoading, isError, error } = usePayment(paymentId);

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader title="Loading payment…" />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Loading this payment…</p>
        </section>
      </AppShell>
    );
  }

  if (isError || !data?.payment) {
    return (
      <AppShell>
        <PageHeader
          title="Payment not found"
          description="This payment does not exist or is not available on your account."
        />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            {describeApiError(error, "The payment you are looking for could not be loaded.")}
          </p>
          <Button asChild variant="outline" className="mt-5">
            <RoleLink to="/payments">Back to payments</RoleLink>
          </Button>
        </section>
      </AppShell>
    );
  }

  const { payment, activity } = data;
  const hasProof = toFlag(payment.has_pop);
  const badge = paymentBadge(payment.payment_status, hasProof);

  return (
    <AppShell>
      <RoleLink
        to="/payments"
        className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to payments
      </RoleLink>

      <PageHeader
        title={payment.payment_reference}
        description={`Payment for order #${payment.order_id}`}
        actions={<StatusBadge label={badge.label} tone={badge.tone} />}
      />

      {payment.payment_status === "rejected" && payment.rejection_reason && (
        <section className="mb-6 bg-danger-soft px-5 py-4">
          <p className="text-sm font-semibold text-foreground">Payment rejected</p>
          <p className="mt-1 text-sm text-danger">{payment.rejection_reason}</p>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Payment summary">
            <dl className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
              <Field label="Payment reference">{payment.payment_reference}</Field>
              <Field label="Related order">
                <RoleLink
                  to="/orders/$orderId"
                  params={{ orderId: String(payment.order_id) }}
                  className="font-semibold text-primary hover:underline"
                >
                  #{payment.order_id}
                </RoleLink>
              </Field>
              <Field label="Amount paid">
                {formatPaymentAmount(payment.amount_paid, payment.currency)}
              </Field>
              <Field label="Payment method">{humanisePaymentMethod(payment.payment_method)}</Field>
              <Field label="Date created">{formatDateTime(payment.created_at)}</Field>
              <Field label="Date submitted">{formatDateTime(payment.submitted_at)}</Field>
              <Field label="Proof of payment">{hasProof ? "Uploaded" : "Not uploaded"}</Field>
            </dl>
          </Panel>

          <Panel
            title="Proof of payment"
            description="Proof availability is recorded on the payment."
          >
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <FileText
                  className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.9}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {hasProof ? "Proof uploaded" : "No proof uploaded yet"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {hasProof
                      ? submittedLabel(payment)
                      : "The payment record does not currently indicate an uploaded proof."}
                  </p>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <Panel title="Payment activity" description="Recorded payment history.">
          {activity.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No activity recorded yet.
            </p>
          ) : (
            <ol className="px-5 py-5">
              {activity.map((event, index) => {
                const Icon = paymentActivityIcon(event.event);
                const description = paymentActivityDescription(event);
                return (
                  <li key={String(event.id)} className="flex gap-3.5">
                    <div className="flex flex-col items-center">
                      <span
                        className={
                          index === 0
                            ? "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent"
                            : "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-border"
                        }
                      />
                      {index < activity.length - 1 && (
                        <span className="my-1 w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className={index < activity.length - 1 ? "pb-6" : ""}>
                      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                        {paymentActivityLabel(event)}
                      </p>
                      {description && (
                        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDateTime(event.created_at)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}

function humanisePaymentMethod(value: string | null | undefined): string {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/^./, (char) => char.toUpperCase());
}

function formatPaymentAmount(amount: string | number, currency: string | null | undefined) {
  const value = toNumber(amount);
  return currency ? formatMoney(value, currency) : value.toLocaleString();
}

function submittedLabel(payment: Payment): string {
  return payment.submitted_at
    ? `Submitted ${formatDateTime(payment.submitted_at)}`
    : "Proof upload is recorded, but no submitted timestamp was returned.";
}

function paymentActivityIcon(event: PaymentActivity["event"]): LucideIcon {
  if (event === "payment_approved") return CheckCircle2;
  if (event === "payment_rejected") return XCircle;
  if (event === "proof_submitted" || event === "replacement_proof_submitted") return FileText;
  return Clock;
}
