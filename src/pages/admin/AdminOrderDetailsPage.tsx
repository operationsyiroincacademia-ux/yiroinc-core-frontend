import { useState, type ReactNode } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Download, ExternalLink, FileText, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/button-loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusTone } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { downloadAdminProof, type AdminPaymentProof } from "@/features/admin/api";
import {
  useAdminOrder,
  useFulfilAdminOrder,
  useRejectAdminOrderPayment,
  useVerifyAdminOrderPayment,
} from "@/features/admin/hooks";
import { formatDateTime, formatMoney, humaniseStatus, toNumber } from "@/features/commerce/format";
import type { Order } from "@/features/orders/api";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";

export function AdminOrderDetailsPage() {
  const { orderId } = useParams({ strict: false }) as { orderId: string };
  const { data, isLoading, isError, error } = useAdminOrder(orderId);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [fulfilOpen, setFulfilOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [activeProofAction, setActiveProofAction] = useState<"open" | "download" | null>(null);

  const paymentId = data?.payment ? idValue(paymentValue(data.payment, "id")) : null;
  const approvePayment = useVerifyAdminOrderPayment(paymentId ?? "", orderId);
  const rejectPayment = useRejectAdminOrderPayment(paymentId ?? "", orderId);
  const fulfilOrder = useFulfilAdminOrder(orderId);

  if (isLoading) {
    return (
      <AdminLayout>
        <PageHeader title="Loading order..." />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Loading this order...</p>
        </section>
      </AdminLayout>
    );
  }

  if (isError || !data?.order) {
    return (
      <AdminLayout>
        <PageHeader title="Order not found" description="This admin order record is unavailable." />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            {describeApiError(error, "The order you are looking for could not be loaded.")}
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/admin/orders">Back to orders</Link>
          </Button>
        </section>
      </AdminLayout>
    );
  }

  const { order, customer, payment, proof, item, timeline } = data;
  const orderBadge = adminOrderStatusBadge(order.admin_order_status);
  const paymentStatus = payment ? String(paymentValue(payment, "payment_status") ?? "") : null;
  const paymentBadge = adminPaymentStatusBadge(paymentStatus, Boolean(proof?.file_id));
  const canApproveReject =
    Boolean(paymentId) && Boolean(proof?.file_id) && isReviewablePaymentStatus(paymentStatus);
  const canFulfil = paymentStatus === "verified" && order.admin_order_status !== "completed";

  const openProof = async (mode: "open" | "download") => {
    setProofError(null);
    if (!proof?.file_id) {
      setProofError("No proof has been submitted for this order.");
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
        toast.success("Payment rejected successfully.");
      },
      onError: (err) => setActionError(describeApiError(err, "Payment could not be rejected.")),
    });
  };

  const confirmFulfil = () => {
    setActionError(null);
    fulfilOrder.mutate(undefined, {
      onSuccess: () => {
        setFulfilOpen(false);
        toast.success("Order fulfilled successfully.");
      },
      onError: (err) => setActionError(describeApiError(err, "Order could not be fulfilled.")),
    });
  };

  return (
    <AdminLayout>
      <Link
        to="/admin/orders"
        className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <PageHeader
        title={order.order_number || `Order #${order.id}`}
        description={order.product_name_snapshot}
        actions={<StatusBadge label={orderBadge.label} tone={orderBadge.tone} />}
      />

      {actionError && (
        <section className="mb-6 bg-danger-soft px-5 py-4">
          <p className="text-sm font-semibold text-danger">{actionError}</p>
        </section>
      )}

      {(canApproveReject || canFulfil) && (
        <section className="mb-6 flex flex-wrap gap-2 border border-border bg-card px-5 py-4">
          {canApproveReject && (
            <>
              <Button
                type="button"
                disabled={approvePayment.isPending}
                onClick={() => {
                  setActionError(null);
                  approvePayment.mutate(undefined, {
                    onSuccess: () => toast.success("Payment approved successfully."),
                    onError: (err) =>
                      setActionError(describeApiError(err, "Payment could not be approved.")),
                  });
                }}
                aria-busy={approvePayment.isPending}
              >
                {approvePayment.isPending ? (
                  <ButtonLoading>Approving...</ButtonLoading>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Approve payment
                  </>
                )}
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
                <XCircle className="h-4 w-4" />
                Reject payment
              </Button>
            </>
          )}
          {canFulfil && (
            <Button
              type="button"
              variant="outline"
              disabled={fulfilOrder.isPending}
              aria-busy={fulfilOrder.isPending}
              onClick={() => {
                setActionError(null);
                setFulfilOpen(true);
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Fulfil order
            </Button>
          )}
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Order summary">
            <dl className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
              {field(order.order_number || `#${order.id}`, "Order")}
              {field(orderTotal(order), "Total")}
              {field(<StatusBadge {...orderBadge} />, "Order status")}
              {field(formatOptionalDate(order.created_at), "Created")}
              {field(formatOptionalDate(order.updated_at), "Updated")}
            </dl>
          </Panel>

          <Panel title="Customer">
            <FieldList items={recordFields(customer, ["display_name", "name", "email", "phone"])} />
          </Panel>

          <Panel title="Item / Product">
            <dl className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
              {field(order.product_name_snapshot, "Product")}
              {field(order.sku_snapshot, "SKU")}
              {field(order.quantity, "Quantity")}
              {field(itemValue(item, "name") ?? itemValue(item, "title"), "Returned item")}
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
                      {field(formatOptionalDate(proof.created_at), "Uploaded")}
                    </dl>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={activeProofAction !== null}
                      aria-busy={activeProofAction === "open"}
                      onClick={() => void openProof("open")}
                    >
                      {activeProofAction === "open" ? (
                        <ButtonLoading>Opening...</ButtonLoading>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          View/Open
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={activeProofAction !== null}
                      aria-busy={activeProofAction === "download"}
                      onClick={() => void openProof("download")}
                    >
                      {activeProofAction === "download" ? (
                        <ButtonLoading>Downloading...</ButtonLoading>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No proof submitted for this order.</p>
              )}
              {proofError && <p className="mt-4 text-sm font-semibold text-danger">{proofError}</p>}
            </div>
          </Panel>

          {timeline.length > 0 && (
            <Panel title="Timeline / activity">
              <Timeline timeline={timeline} />
            </Panel>
          )}
        </div>

        <Panel title="Payment">
          {payment ? (
            <dl className="grid grid-cols-1 gap-5 px-5 py-5">
              {field(paymentValue(payment, "payment_reference"), "Payment reference")}
              {field(paymentAmount(payment), "Amount")}
              {field(humanisePaymentMethod(paymentValue(payment, "payment_method")), "Method")}
              {field(<StatusBadge {...paymentBadge} />, "Status")}
              {field(
                formatOptionalDate(String(paymentValue(payment, "submitted_at") ?? "")),
                "Submitted",
              )}
              {field(
                formatOptionalDate(String(paymentValue(payment, "verified_at") ?? "")),
                "Approved at",
              )}
              {field(
                formatOptionalDate(String(paymentValue(payment, "rejected_at") ?? "")),
                "Rejected at",
              )}
              {field(paymentValue(payment, "rejection_reason"), "Rejection reason")}
              {paymentId && (
                <Field label="Payment record">
                  <Link
                    to="/admin/payments/$paymentId"
                    params={{ paymentId: String(paymentId) }}
                    className="font-semibold text-primary hover:underline"
                  >
                    Open payment details
                  </Link>
                </Field>
              )}
            </dl>
          ) : (
            <p className="px-5 py-5 text-sm text-muted-foreground">
              No related payment was returned.
            </p>
          )}
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
              aria-busy={rejectPayment.isPending}
              onClick={submitReject}
            >
              {rejectPayment.isPending ? (
                <ButtonLoading>Rejecting...</ButtonLoading>
              ) : (
                "Reject payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={fulfilOpen} onOpenChange={setFulfilOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fulfil this order?</DialogTitle>
            <DialogDescription>
              This confirms that the customer has received/accessed their purchase. The order will
              be marked as completed.
            </DialogDescription>
          </DialogHeader>
          {actionError && <p className="text-sm font-semibold text-danger">{actionError}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={fulfilOrder.isPending}
              onClick={() => setFulfilOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={fulfilOrder.isPending}
              aria-busy={fulfilOrder.isPending}
              onClick={confirmFulfil}
            >
              {fulfilOrder.isPending ? (
                <ButtonLoading>Fulfilling...</ButtonLoading>
              ) : (
                "Confirm fulfilment"
              )}
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
  if (value === null || value === undefined || value === "") return null;
  return <Field label={label}>{value}</Field>;
}

function FieldList({ items }: { items: { label: string; value: ReactNode }[] }) {
  if (items.length === 0) {
    return <p className="px-5 py-5 text-sm text-muted-foreground">No details were returned.</p>;
  }
  return (
    <dl className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
      {items.map((item) => (
        <Field key={item.label} label={item.label}>
          {item.value}
        </Field>
      ))}
    </dl>
  );
}

function recordFields(record: Record<string, unknown> | null, keys: string[]) {
  if (!record) return [];
  return keys
    .map((key) => ({ label: humaniseStatus(key), value: scalar(record[key]) }))
    .filter((item): item is { label: string; value: string | number | boolean } =>
      Boolean(item.value),
    );
}

function Timeline({ timeline }: { timeline: unknown[] }) {
  return (
    <ol className="space-y-4 px-5 py-5">
      {timeline.map((entry, index) => (
        <li key={index}>
          <p className="text-sm text-foreground">{timelineText(entry)}</p>
          {timelineTime(entry) && (
            <p className="mt-0.5 text-xs text-muted-foreground">{timelineTime(entry)}</p>
          )}
        </li>
      ))}
    </ol>
  );
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

function adminPaymentStatusBadge(
  status: string | null,
  hasProof: boolean,
): { label: string; tone: StatusTone } {
  if (status === "verified") return { label: "Approved", tone: "success" };
  if (status === "rejected") return { label: "Rejected", tone: "danger" };
  if (isReviewablePaymentStatus(status) && hasProof) {
    return { label: "Awaiting approval", tone: "info" };
  }
  if (isReviewablePaymentStatus(status)) return { label: "Pending", tone: "warning" };
  return { label: status ? humaniseStatus(status) : "No payment", tone: "neutral" };
}

function isReviewablePaymentStatus(status: string | null) {
  return status === "pending" || status === "submitted";
}

function formatOptionalDate(value: string | null | undefined) {
  return value ? formatDateTime(value) : null;
}

function scalar(value: unknown): string | number | boolean | null {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? value
    : null;
}

function itemValue(record: Record<string, unknown> | null, key: string) {
  return record ? scalar(record[key]) : null;
}

function paymentValue(record: Record<string, unknown> | null, key: string) {
  return record ? scalar(record[key]) : null;
}

function idValue(value: string | number | boolean | null): string | number | null {
  return typeof value === "string" || typeof value === "number" ? value : null;
}

function paymentAmount(record: Record<string, unknown> | null) {
  const amount = paymentValue(record, "amount_paid");
  const currency = paymentValue(record, "currency");
  if (!amount) return null;
  return currency ? formatMoney(toNumber(amount as string | number), String(currency)) : amount;
}

function humanisePaymentMethod(value: unknown): string | null {
  const method = scalar(value);
  return method ? humaniseStatus(String(method)) : null;
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

function timelineText(entry: unknown) {
  if (typeof entry === "string") return humaniseStatus(entry);
  if (!entry || typeof entry !== "object") return "Activity recorded";
  const record = entry as Record<string, unknown>;
  const richText = record.message ?? record.description ?? record.title;
  if (richText) return String(richText);
  const event = record.event ?? record.status ?? record.type;
  return typeof event === "string" ? humaniseStatus(event) : "Activity recorded";
}

function timelineTime(entry: unknown) {
  if (!entry || typeof entry !== "object") return null;
  const record = entry as Record<string, unknown>;
  const value = record.created_at ?? record.timestamp ?? record.date;
  return typeof value === "string" ? formatDateTime(value) : null;
}
