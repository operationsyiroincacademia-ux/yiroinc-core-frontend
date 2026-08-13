import { useParams } from "@tanstack/react-router";
import { RoleLink } from "@/components/shared/RoleLink";
import { ArrowLeft, Download, Upload, FileText, RefreshCw } from "lucide-react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  findPayment,
  PAYMENT_PROOFS,
  PAYMENT_TIMELINE,
} from "@/features/payments/preview-data";

/**
 * Data sources once the API layer is wired:
 *   GET  /payments/{id}       — payment record and verification status
 *   GET  /orders/{id}         — related order reference
 *   GET  /files               — proof file where related_type = payment,
 *                               related_id = this payment ID
 *   POST /files               — upload/replace proof: the payment record is
 *                               created FIRST, then the file is uploaded with
 *                               related_type = payment, related_id = payment ID,
 *                               file_type = proof_of_payment
 *   GET  /timeline            — payment activity / status updates
 *   GET  /files/{id}/download — authenticated download
 * No values are hardcoded in this component; verification is admin-only and
 * is therefore read-only here.
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
  const payment = findPayment(Number(paymentId));

  if (!payment) {
    return (
      <AppShell>
        <PageHeader
          title="Payment not found"
          description="This payment does not exist or is not available on your account."
        />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            The payment you are looking for could not be loaded.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <RoleLink to="/payments">Back to payments</RoleLink>
          </Button>
        </section>
      </AppShell>
    );
  }

  const proof = PAYMENT_PROOFS[payment.id] ?? null;
  const timeline = PAYMENT_TIMELINE[payment.id] ?? [];

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
        title={payment.reference}
        description={`Payment for ${payment.orderReference}`}
        actions={<StatusBadge label={payment.status} tone={payment.tone} />}
      />

      {!proof && (
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
                  This payment record is created. Attach your receipt so it can be
                  verified.
                </p>
              </div>
            </div>
            <Button size="sm">
              <Upload className="h-4 w-4" strokeWidth={2} />
              Upload proof
            </Button>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Payment summary">
            <dl className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
              <Field label="Payment reference">{payment.reference}</Field>
              <Field label="Related order">
                <RoleLink
                  to="/orders/$orderId"
                  params={{ orderId: String(payment.orderId) }}
                  className="font-semibold text-primary hover:underline"
                >
                  {payment.orderReference}
                </RoleLink>
              </Field>
              <Field label="Amount paid">{payment.amountPaid}</Field>
              <Field label="Date submitted">{payment.submittedAt}</Field>
              <Field label="Verification status">
                <StatusBadge label={payment.status} tone={payment.tone} />
              </Field>
              <Field label="Proof of payment">
                {proof ? "Uploaded" : "Not uploaded"}
              </Field>
            </dl>
          </Panel>

          <Panel
            title="Proof of payment"
            description="The receipt attached to this payment record."
            action={
              proof ? (
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" strokeWidth={2} />
                  Replace proof
                </Button>
              ) : undefined
            }
          >
            {!proof ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-semibold text-foreground">
                  No proof uploaded yet
                </p>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                  Upload a bank receipt or transfer screenshot so the finance team can
                  verify this payment.
                </p>
                <Button size="sm" className="mt-5">
                  <Upload className="h-4 w-4" strokeWidth={2} />
                  Upload proof
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="flex min-w-0 items-start gap-3">
                  <FileText
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                    strokeWidth={1.9}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {proof.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {proof.fileType} · {proof.size} · Uploaded {proof.uploadedAt}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" strokeWidth={2} />
                  Download
                </Button>
              </div>
            )}
          </Panel>
        </div>

        <Panel
          title="Payment activity"
          description="Recorded updates on this payment."
        >
          {timeline.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No activity recorded yet.
            </p>
          ) : (
            <ol className="px-5 py-5">
              {timeline.map((event, index) => (
                <li key={event.id} className="flex gap-3.5">
                  <div className="flex flex-col items-center">
                    <span
                      className={
                        index === 0
                          ? "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent"
                          : "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-border"
                      }
                    />
                    {index < timeline.length - 1 && (
                      <span className="my-1 w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className={index < timeline.length - 1 ? "pb-6" : ""}>
                    <p className="text-sm font-semibold text-foreground">
                      {event.label}
                    </p>
                    {event.detail && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {event.detail}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground">{event.at}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
