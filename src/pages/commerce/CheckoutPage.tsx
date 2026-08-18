import { useRef, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { ArrowLeft, Building2, CheckCircle2, Copy, FileText, Info, Upload } from "lucide-react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { RoleLink } from "@/components/shared/RoleLink";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { describeApiError, type UploadedProof } from "@/features/commerce/api";
import {
  useBankAccount,
  useCreatePayment,
  useOrder,
  useUploadProof,
} from "@/features/commerce/hooks";
import {
  formatMoney,
  humaniseStatus,
  orderStatusLabel,
  paymentStatusLabel,
  toNumber,
  validateProofFile,
} from "@/features/commerce/format";

/**
 * Manual checkout — shared across Academic, Exam Candidate and Corporate.
 *
 * The route carries only the order id. Everything shown here is fetched from
 * GET /orders/{id}: order_number (narration), product_name_snapshot, quantity,
 * unit_price, total_price and the three status fields. Bank details come from
 * GET /settings/bank-account. The user only selects a receipt file.
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
      <header className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-bold tracking-tight text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </header>
      {children}
    </section>
  );
}

function Row({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
        {value}
        {copyable && (
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(value)}
            aria-label={`Copy ${label}`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Copy className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
      </span>
    </div>
  );
}

export function CheckoutPage() {
  const { orderId } = useParams({ strict: false }) as { orderId: string };

  const orderQuery = useOrder(orderId);
  const bank = useBankAccount();
  const createPayment = useCreatePayment();
  const uploadProof = useUploadProof();

  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<UploadedProof | null>(null);
  /** Reused across retries so repeated clicks never create duplicate records. */
  const paymentIdRef = useRef<number | null>(null);

  if (orderQuery.isPending) {
    return (
      <AppShell>
        <PageHeader title="Loading order…" />
        <div className="h-72 animate-pulse border border-border bg-muted" />
      </AppShell>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <AppShell>
        <PageHeader
          title="Checkout unavailable"
          description={describeApiError(orderQuery.error, "This order could not be loaded.")}
        />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="mb-5 text-sm text-muted-foreground">
            Open the order from your orders list, or place the order again from the store.
          </p>
          <Button asChild variant="outline">
            <RoleLink to="/services">Back to Yiroinc Store</RoleLink>
          </Button>
        </section>
      </AppShell>
    );
  }

  const order = orderQuery.data;
  const isResourceOrder = order.order_source === "resource";
  const backTarget = isResourceOrder ? "/resources" : "/services";
  const backLabel = isResourceOrder ? "Back to resources" : "Back to Yiroinc Store";
  const numericOrderId = toNumber(order.id);
  const orderNumber = order.order_number;
  const total = toNumber(order.total_price);
  const unitPrice = toNumber(order.unit_price);
  const quantity = toNumber(order.quantity);
  const currency = order.currency;
  const existingPaymentId =
    order.payment_id === null || order.payment_id === undefined || order.payment_id === ""
      ? null
      : toNumber(order.payment_id);
  const hasProof = toNumber(order.has_pop) === 1;
  const money = (value: number) => formatMoney(value, currency);
  const totalLabel = money(total);

  const submit = async () => {
    if (!file || submitting) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      if (paymentIdRef.current === null) {
        paymentIdRef.current = existingPaymentId;
      }
      if (paymentIdRef.current === null) {
        const payment = await createPayment.mutateAsync(numericOrderId);
        paymentIdRef.current = payment.payment_id;
      }
      const uploaded = await uploadProof.mutateAsync({
        paymentId: paymentIdRef.current,
        file,
      });
      setResult(uploaded);
    } catch (error) {
      setSubmitError(
        describeApiError(error, "Your proof of payment could not be submitted. Please try again."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const payment = paymentStatusLabel(result.payment_status, true);
    const orderState = orderStatusLabel(result.order_status);
    return (
      <AppShell>
        <PageHeader title="Proof of payment received" description={result.message} />

        <section className="border border-border bg-card">
          <div className="border-b border-border bg-success-soft px-5 py-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2} />
              Proof of payment uploaded successfully
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {file?.name ?? "Receipt"} was attached to this payment record.
            </p>
          </div>

          <div className="divide-y divide-border">
            <Row label="Order reference" value={orderNumber} />
            <Row label="Item" value={order.product_name_snapshot} />
            <Row label="Amount" value={totalLabel} />
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                Payment status
              </span>
              <StatusBadge label={payment.label} tone={payment.tone} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                Order status
              </span>
              <StatusBadge label={orderState.label} tone={orderState.tone} />
            </div>
          </div>

          <div className="border-t border-border px-5 py-5">
            <p className="text-xs text-muted-foreground">
              An administrator will verify your transfer manually. Your order remains on hold until
              verification is complete — you will be notified of any change.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild>
                <RoleLink to={`/orders/${order.id}`}>View order details</RoleLink>
              </Button>
              <Button asChild variant="outline">
                <RoleLink to={`/payments/${result.related_id}`}>View payment details</RoleLink>
              </Button>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  const currentOrderStatus = orderStatusLabel(order.order_status);
  const currentPaymentStatus = paymentStatusLabel(
    order.related_payment_status ?? order.payment_status,
    hasProof,
  );

  return (
    <AppShell>
      <RoleLink
        to={backTarget}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        {backLabel}
      </RoleLink>

      <PageHeader
        title="Complete your payment"
        description="Your order has been created. Pay by bank transfer, then upload your proof of payment."
      />

      <div className="mb-4 flex items-start gap-2 bg-warning-soft px-5 py-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-foreground" strokeWidth={2} />
        <p className="text-xs text-foreground">
          There is no automated payment gateway on this platform. All payments are made by bank
          transfer and verified manually by our team.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Panel title="Order summary">
            <div className="divide-y divide-border">
              <Row label="Order reference" value={orderNumber} copyable />
              <Row label="Item" value={order.product_name_snapshot} />
              {order.sku_snapshot && <Row label="SKU" value={order.sku_snapshot} />}
              <Row label="Quantity" value={String(quantity)} />
              <Row label="Unit price" value={money(unitPrice)} />
              <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                  Order status
                </span>
                <StatusBadge label={currentOrderStatus.label} tone={currentOrderStatus.tone} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                  Payment status
                </span>
                <StatusBadge label={currentPaymentStatus.label} tone={currentPaymentStatus.tone} />
              </div>
              <Row label="Fulfillment" value={humaniseStatus(order.fulfillment_status)} />
              <div className="flex flex-wrap items-center justify-between gap-2 bg-muted px-5 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                  Total amount due
                </span>
                <span className="text-lg font-extrabold tracking-tight text-foreground">
                  {totalLabel}
                </span>
              </div>
            </div>
          </Panel>

          <Panel
            title="Bank transfer details"
            description="Transfer the exact total to the account below."
          >
            {bank.isPending && (
              <div className="px-5 py-8">
                <div className="h-24 animate-pulse bg-muted" />
              </div>
            )}

            {bank.isError && (
              <p className="px-5 py-8 text-sm text-danger">
                {describeApiError(
                  bank.error,
                  "Bank details are currently unavailable. Please try again shortly.",
                )}
              </p>
            )}

            {bank.data && (
              <>
                <div className="divide-y divide-border">
                  <Row label="Account name" value={bank.data.account_name} copyable />
                  <Row label="Account number" value={bank.data.account_number} copyable />
                  <Row label="Bank" value={bank.data.bank_name} />
                  <Row label="Currency" value={bank.data.currency} />
                </div>

                <div className="border-t border-border px-5 py-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                    Use this exact narration / reference
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 bg-muted px-4 py-3">
                    <code className="text-sm font-semibold text-foreground">{orderNumber}</code>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(orderNumber)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                      Copy
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {bank.data.payment_instruction}
                  </p>
                  <ol className="mt-5 space-y-2 text-xs text-muted-foreground">
                    <li>1. Transfer {totalLabel} to the account above.</li>
                    <li>2. Include the narration exactly as shown.</li>
                    <li>3. Save the receipt or transfer screenshot.</li>
                    <li>4. Upload it here so our team can verify your payment.</li>
                  </ol>
                </div>
              </>
            )}
          </Panel>
        </div>

        <aside className="h-fit border border-border bg-card">
          <header className="flex items-center gap-2 border-b border-border px-5 py-4">
            <Building2 className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              Upload proof of payment
            </h2>
          </header>
          <div className="px-5 py-5">
            <p className="text-xs text-muted-foreground">
              Attach the bank receipt or transfer screenshot only. The amount and payment reference
              are taken from your order automatically.
            </p>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                if (!selected) return;
                const invalid = validateProofFile(selected);
                setFileError(invalid);
                setSubmitError(null);
                if (!invalid) setFile(selected);
              }}
            />

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 flex w-full flex-col items-center gap-2 border border-dashed border-border bg-muted px-4 py-8 text-center transition-colors hover:border-primary"
            >
              <Upload className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
              <span className="text-xs font-semibold text-foreground">
                Choose receipt or screenshot
              </span>
              <span className="text-[11px] text-muted-foreground">
                JPG, PNG, WEBP or PDF — up to 5 MB
              </span>
            </button>

            {file && (
              <p className="mt-3 flex items-center gap-2 border border-border bg-card px-3 py-2.5 text-xs text-foreground">
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={2} />
                <span className="truncate">{file.name}</span>
              </p>
            )}

            {fileError && (
              <p className="mt-3 bg-danger-soft px-3 py-2.5 text-xs text-danger">{fileError}</p>
            )}

            <Button className="mt-5 w-full" disabled={!file || submitting} onClick={submit}>
              {submitting ? "Uploading…" : "Upload proof of payment"}
            </Button>

            {submitError && (
              <p className="mt-3 bg-danger-soft px-3 py-2.5 text-xs text-danger">{submitError}</p>
            )}

            <p className="mt-3 text-[11px] text-muted-foreground">
              Your order stays on hold until an administrator verifies the payment.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
