import { useState, type ReactNode } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  downloadAdminProof,
  type AdminPaymentCustomer,
  type AdminPaymentProof,
} from "@/features/admin/api";
import {
  useAdminPayment,
  useRejectAdminPayment,
  useVerifyAdminPayment,
} from "@/features/admin/hooks";
import { formatDateTime, formatMoney, humaniseStatus, toNumber } from "@/features/commerce/format";
import type { Payment, PaymentActivity } from "@/features/payments/api";
import { paymentActivityDescription, paymentActivityLabel } from "@/features/payments/activity";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";
import type { StatusTone } from "@/components/ui/status-badge";

export function AdminPaymentDetailsPage() {
  const { paymentId } = useParams({ strict: false }) as { paymentId: string };
  const { data, isLoading, isError, error } = useAdminPayment(paymentId);
  const verifyPayment = useVerifyAdminPayment(paymentId);
  const rejectPayment = useRejectAdminPayment(paymentId);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [activeProofAction, setActiveProofAction] = useState<"open" | "download" | null>(null);

  if (isLoading) {
    return (
      <AdminLayout>
        <PageHeader title="Loading payment..." />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Loading this payment...</p>
        </section>
      </AdminLayout>
    );
  }

  if (isError || !data?.payment) {
    return (
      <AdminLayout>
        <PageHeader
          title="Payment not found"
          description="This admin payment record is unavailable."
        />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            {describeApiError(error, "The payment you are looking for could not be loaded.")}
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/admin/payments">Back to payments</Link>
          </Button>
        </section>
      </AdminLayout>
    );
  }

  const { payment, order, customer, proof, activity } = data;
  const badge = adminPaymentBadge(payment, proof);
  const awaitingVerification = isAwaitingVerification(payment, proof);

  const openProof = async (mode: "open" | "download") => {
    setProofError(null);
    if (!proof?.file_id) {
      setProofError("This payment proof is not available.");
      return;
    }

    setActiveProofAction(mode);
    try {
      const blob = await downloadAdminProof(proof.file_id);
      const url = URL.createObjectURL(blob);
      if (mode === "download") {
        const link = document.createElement("a");
        link.href = url;
        link.download = proofFileName(proof);
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return;
      }

      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (!opened) {
        URL.revokeObjectURL(url);
        setProofError("Your browser blocked the proof preview. Use Download instead.");
        return;
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setProofError(describeApiError(err, "This proof could not be opened."));
    } finally {
      setActiveProofAction(null);
    }
  };

  const submitReject = () => {
    const reason = rejectionReason.trim();
    if (!reason) {
      setActionError("Enter a rejection reason.");
      return;
    }
    setActionError(null);
    rejectPayment.mutate(reason, {
      onSuccess: () => {
        setRejectOpen(false);
        setRejectionReason("");
      },
      onError: (err) => {
        setActionError(describeApiError(err, "Payment could not be rejected."));
      },
    });
  };

  return (
    <AdminLayout>
      <Link
        to="/admin/payments"
        className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to payments
      </Link>

      <PageHeader
        title={payment.payment_reference}
        description={payment.order_id ? `Payment for order #${payment.order_id}` : undefined}
        actions={<StatusBadge label={badge.label} tone={badge.tone} />}
      />

      {actionError && (
        <section className="mb-6 bg-danger-soft px-5 py-4">
          <p className="text-sm font-semibold text-danger">{actionError}</p>
        </section>
      )}

      {awaitingVerification && (
        <section className="mb-6 flex flex-wrap gap-2 border border-border bg-card px-5 py-4">
          <Button
            type="button"
            disabled={verifyPayment.isPending}
            onClick={() => {
              setActionError(null);
              verifyPayment.mutate(undefined, {
                onError: (err) => {
                  setActionError(describeApiError(err, "Payment could not be approved."));
                },
              });
            }}
          >
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
            {verifyPayment.isPending ? "Approving..." : "Approve payment"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={rejectPayment.isPending}
            onClick={() => {
              setActionError(null);
              setRejectOpen(true);
            }}
          >
            <XCircle className="h-4 w-4" strokeWidth={2} />
            Reject payment
          </Button>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Payment summary">
            <dl className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
              {field(payment.payment_reference, "Payment reference")}
              {field(paymentAmount(payment), "Amount")}
              {field(humanisePaymentMethod(payment.payment_method), "Payment method")}
              {field(<StatusBadge label={badge.label} tone={badge.tone} />, "Status")}
              {field(
                formatOptionalDateTime(payment.submitted_at ?? payment.created_at),
                "Submitted",
              )}
              {field(orderLabel(order, payment), "Related order")}
            </dl>
          </Panel>

          <Panel title="Customer">
            <dl className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
              {customerFields(customer).map((item) => (
                <Field key={item.label} label={item.label}>
                  {item.value}
                </Field>
              ))}
              {customerFields(customer).length === 0 && (
                <p className="text-sm text-muted-foreground">No customer details were returned.</p>
              )}
            </dl>
          </Panel>

          <Panel title="Proof of Payment">
            <div className="px-5 py-5">
              {proof?.file_id ? (
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <dl className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                      {field(proofFileName(proof), "Filename")}
                      {field(proof.mime_type, "File type")}
                      {field(formatBytes(proof.file_size), "Size")}
                      {field(formatOptionalDateTime(proof.created_at), "Uploaded")}
                    </dl>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={activeProofAction !== null}
                      onClick={() => void openProof("open")}
                    >
                      <ExternalLink className="h-4 w-4" strokeWidth={2} />
                      {activeProofAction === "open" ? "Opening..." : "View/Open"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={activeProofAction !== null}
                      onClick={() => void openProof("download")}
                    >
                      <Download className="h-4 w-4" strokeWidth={2} />
                      {activeProofAction === "download" ? "Downloading..." : "Download"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No proof metadata was returned for this payment.
                </p>
              )}
              {proofError && <p className="mt-4 text-sm font-semibold text-danger">{proofError}</p>}
            </div>
          </Panel>

          <Panel title="Payment activity">
            {activity.length === 0 ? (
              <p className="px-5 py-5 text-sm text-muted-foreground">
                No payment activity was returned.
              </p>
            ) : (
              <PaymentActivityTimeline activity={activity} />
            )}
          </Panel>
        </div>

        <Panel title="Order">
          <dl className="grid grid-cols-1 gap-5 px-5 py-5">
            {orderFields(order).map((item) => (
              <Field key={item.label} label={item.label}>
                {item.value}
              </Field>
            ))}
            {orderFields(order).length === 0 && (
              <p className="text-sm text-muted-foreground">No order details were returned.</p>
            )}
          </dl>
        </Panel>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject payment</DialogTitle>
            <DialogDescription>
              Provide the reason shown on the payment record after rejection.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Rejection reason"
            aria-label="Rejection reason"
            className="min-h-28"
          />
          {actionError && <p className="text-sm font-semibold text-danger">{actionError}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={rejectPayment.isPending}
              onClick={submitReject}
            >
              {rejectPayment.isPending ? "Rejecting..." : "Reject payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-border bg-card">
      <header className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-bold tracking-tight text-foreground">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{children}</dd>
    </div>
  );
}

function field(value: ReactNode, label: string) {
  if (!hasValue(value)) return null;
  return <Field label={label}>{value}</Field>;
}

function PaymentActivityTimeline({ activity }: { activity: PaymentActivity[] }) {
  return (
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
              {index < activity.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}
            </div>
            <div className={index < activity.length - 1 ? "pb-6" : ""}>
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                {paymentActivityLabel(event)}
              </p>
              {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDateTime(event.created_at)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function hasValue(value: ReactNode): boolean {
  return value !== null && value !== undefined && value !== "";
}

function isAwaitingVerification(payment: Payment, proof: AdminPaymentProof | null) {
  return (
    (payment.payment_status === "pending" || payment.payment_status === "submitted") &&
    Boolean(proof?.file_id)
  );
}

function adminPaymentBadge(
  payment: Payment,
  proof: AdminPaymentProof | null,
): { label: string; tone: StatusTone } {
  if (payment.payment_status === "verified") return { label: "Approved", tone: "success" };
  if (payment.payment_status === "rejected") return { label: "Rejected", tone: "danger" };

  const reviewableStatus =
    payment.payment_status === "pending" || payment.payment_status === "submitted";

  if (reviewableStatus && proof?.file_id) {
    return { label: "Awaiting approval", tone: "info" };
  }
  if (reviewableStatus) return { label: "Pending", tone: "warning" };

  return { label: payment.payment_status || "-", tone: "neutral" };
}

function paymentAmount(payment: Payment) {
  const amount = toNumber(payment.amount_paid);
  return payment.currency ? formatMoney(amount, payment.currency) : amount.toLocaleString();
}

function humanisePaymentMethod(value: string | null | undefined): string | null {
  if (!value) return null;
  return humaniseStatus(value);
}

function proofFileName(proof: AdminPaymentProof) {
  return proof.original_name || proof.file_name || `proof-${proof.file_id}`;
}

function formatBytes(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  const bytes = Number(value);
  if (!Number.isFinite(bytes)) return String(value);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatOptionalDateTime(value: string | null | undefined): string | null {
  return value ? formatDateTime(value) : null;
}

function orderLabel(order: Record<string, unknown> | null, payment: Payment): ReactNode {
  const orderNumber = scalar(order?.order_number);
  const id = scalar(order?.id) ?? payment.order_id;
  if (!hasValue(id)) return null;
  return orderNumber ? `${orderNumber} (#${id})` : `#${id}`;
}

function customerFields(customer: AdminPaymentCustomer | null) {
  if (!customer) return [];
  const preferred = [
    ["Name", customer.display_name ?? customer.name ?? customer.full_name],
    ["Email", customer.email ?? customer.user_email],
    ["Phone", customer.phone ?? customer.phone_number],
  ];
  return preferred
    .map(([label, value]) => ({ label: String(label), value: scalar(value) }))
    .filter((item): item is { label: string; value: string | number | boolean } =>
      hasValue(item.value),
    );
}

function orderFields(order: Record<string, unknown> | null) {
  if (!order) return [];
  const rawTotal = scalar(order.total_price);
  const rawCurrency = scalar(order.currency);
  const total =
    hasValue(rawTotal) && hasValue(rawCurrency)
      ? formatMoney(toNumber(rawTotal as string | number), String(rawCurrency))
      : rawTotal;
  const preferred = [
    ["Order number", order.order_number],
    ["Product", order.product_name_snapshot ?? order.product_name],
    ["Total", total],
    ["Order status", order.order_status ? humaniseStatus(String(order.order_status)) : null],
    ["Payment status", order.payment_status ? humaniseStatus(String(order.payment_status)) : null],
    [
      "Fulfillment status",
      order.fulfillment_status ? humaniseStatus(String(order.fulfillment_status)) : null,
    ],
  ];
  return preferred
    .map(([label, value]) => ({ label: String(label), value: scalar(value) }))
    .filter((item): item is { label: string; value: string | number | boolean } =>
      hasValue(item.value),
    );
}

function scalar(value: unknown): string | number | boolean | null {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return null;
}

function paymentActivityIcon(event: PaymentActivity["event"]): LucideIcon {
  if (event === "payment_approved") return CheckCircle2;
  if (event === "payment_rejected") return XCircle;
  if (event === "proof_submitted" || event === "replacement_proof_submitted") return FileText;
  return Clock;
}
