import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CreditCard, FileText, ShoppingBag, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/DashboardCard";
import { TableScroll } from "@/components/shared/TableScroll";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/button-loading";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import type { AdminUser, AdminUserDetail } from "@/features/admin/api";
import { useAdminUser, useCloseAdminUser } from "@/features/admin/hooks";
import {
  adminUserDisplayName,
  adminUserJoinedAt,
  adminUserTypeLabel,
  examLevelLabel,
} from "@/features/admin/user-format";
import {
  formatDate,
  formatDateTime,
  formatMoney,
  humaniseStatus,
  toFlag,
  toNumber,
} from "@/features/commerce/format";
import type { Order } from "@/features/orders/api";
import type { Payment } from "@/features/payments/api";
import type { Resource } from "@/features/resources/api";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { ApiError } from "@/lib/api/client";
import { describeApiError } from "@/lib/api/errors";

const MAX_CLOSE_REASON_LENGTH = 1000;
const CUSTOMER_PROFILE_TYPES = new Set([
  "academic_user",
  "cfa_candidate",
  "frm_candidate",
  "corporate_client",
]);

const PROFILE_FIELD_ORDER = [
  "profile_type",
  "phone",
  "organization_name",
  "exam_type",
  "exam_level",
  "institution",
  "area_of_interest",
  "country",
];

const SUMMARY_LABELS: Record<string, string> = {
  orders: "Orders",
  payments: "Payments",
  resource_entitlements: "Resources",
  tutor_requests: "Tutor Requests",
  consulting_requests: "Consulting Requests",
  procurements: "Procurements",
};

export function AdminUserDetailsPage() {
  const { userId } = useParams({ strict: false }) as { userId: string };
  const { data, isLoading, isError, error, refetch } = useAdminUser(userId);
  const closeUser = useCloseAdminUser(userId);
  const [closeOpen, setCloseOpen] = useState(false);
  const [closeReason, setCloseReason] = useState("");
  const [closeError, setCloseError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <AdminLayout>
        <PageHeader title="Loading user..." />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Loading user details...</p>
        </section>
      </AdminLayout>
    );
  }

  if (isError || !data?.user) {
    return (
      <AdminLayout>
        <PageHeader title="User not found" description="This user record is unavailable." />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            {describeApiError(error, "The user you are looking for could not be loaded.")}
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/admin/users">Back to users</Link>
          </Button>
        </section>
      </AdminLayout>
    );
  }

  const { user } = data;
  const closeReasonTrimmed = closeReason.trim();
  const canCloseAccount =
    accountStatus(user) === "active" &&
    typeof user.profile_type === "string" &&
    CUSTOMER_PROFILE_TYPES.has(user.profile_type);

  const onCloseOpenChange = (open: boolean) => {
    setCloseOpen(open);
    if (!open && !closeUser.isPending) {
      setCloseReason("");
      setCloseError(null);
    }
  };

  const submitCloseAccount = async () => {
    if (!closeReasonTrimmed) {
      setCloseError("Enter a reason for closure.");
      return;
    }
    if (closeReasonTrimmed.length > MAX_CLOSE_REASON_LENGTH || closeUser.isPending) return;

    try {
      setCloseError(null);
      await closeUser.mutateAsync({ reason: closeReasonTrimmed });
      onCloseOpenChange(false);
      toast.success("Customer account closed successfully.");
    } catch (err) {
      const message = closeAccountError(err);
      setCloseError(message);
      toast.error(message);
      if (isAlreadyClosedError(err)) {
        void refetch();
      }
    }
  };

  return (
    <AdminLayout>
      <Button asChild variant="ghost" className="mb-5 px-0">
        <Link to="/admin/users">
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </Link>
      </Button>

      <PageHeader
        title={adminUserDisplayName(user)}
        description={user.email || `User #${user.id}`}
        actions={<StatusBadge label={adminUserTypeLabel(user.profile_type)} tone="info" />}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="User / Account">
          <dl className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
            {accountFields(user).map((item) => (
              <Field key={item.label} label={item.label}>
                {item.value}
              </Field>
            ))}
          </dl>
          {canCloseAccount ? (
            <div className="flex justify-end border-t border-border px-5 py-4">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onCloseOpenChange(true)}
              >
                Close account
              </Button>
            </div>
          ) : null}
        </Panel>

        {profileFields(data).length > 0 ? (
          <Panel title="Profile">
            <dl className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
              {profileFields(data).map((item) => (
                <Field key={item.label} label={item.label}>
                  {item.value}
                </Field>
              ))}
            </dl>
          </Panel>
        ) : null}
      </div>

      {summaryEntries(data).length > 0 ? (
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summaryEntries(data).map((item) => (
            <SummaryCard key={item.key} label={item.label} value={item.value} icon={item.icon} />
          ))}
        </section>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {data.orders.length > 0 ? <RecentOrders orders={data.orders} /> : null}
        {data.payments.length > 0 ? <RecentPayments payments={data.payments} /> : null}
        {hasAnyRequests(data) ? <RequestsPanel data={data} /> : null}
        {data.resources.length > 0 ? <PurchasedResources resources={data.resources} /> : null}
      </div>

      <Dialog open={closeOpen} onOpenChange={onCloseOpenChange}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Close customer account?</DialogTitle>
            <DialogDescription>
              This will permanently close the customer's YiroInc Academia account and remove their
              access. Historical orders, payments and other business records will remain available
              for administrative history.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This action cannot restore the existing account later.
            </p>
            <div>
              <Label htmlFor="close-account-reason">Reason for closure</Label>
              <Textarea
                id="close-account-reason"
                value={closeReason}
                onChange={(event) => {
                  setCloseReason(event.target.value);
                  setCloseError(null);
                }}
                maxLength={MAX_CLOSE_REASON_LENGTH}
                disabled={closeUser.isPending}
                placeholder="Enter the reason for closing this account"
                aria-invalid={Boolean(closeError)}
                aria-describedby="close-account-reason-help"
                className={closeError ? "mt-2 min-h-32 border-danger" : "mt-2 min-h-32"}
              />
              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                <p
                  id="close-account-reason-help"
                  role={closeError ? "alert" : undefined}
                  className={closeError ? "text-xs text-danger" : "text-xs text-muted-foreground"}
                >
                  {closeError ?? "Required. Maximum 1000 characters."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {closeReason.length}/{MAX_CLOSE_REASON_LENGTH}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={closeUser.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={!closeReasonTrimmed || closeUser.isPending}
              aria-busy={closeUser.isPending}
              onClick={submitCloseAccount}
            >
              {closeUser.isPending ? <ButtonLoading>Closing...</ButtonLoading> : "Close account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 border border-border bg-card">
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

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof ShoppingBag;
}) {
  return (
    <article className="border border-border bg-card p-5">
      <div className="flex items-center gap-2.5 text-muted-foreground">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
        <span className="text-xs font-semibold uppercase tracking-[0.07em]">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
        {toNumber(value)}
      </p>
    </article>
  );
}

function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <Panel title="Recent Orders">
      <TableScroll>
        <table className="w-full min-w-[620px] text-left">
          <thead>
            <tr className="border-b border-border">
              {["Order", "Amount", "Status", "Date", ""].map((heading, index) => (
                <th
                  key={heading || `action-${index}`}
                  className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={String(order.id)} className="transition-colors hover:bg-muted/40">
                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-foreground">
                  <Link
                    to="/admin/orders/$orderId"
                    params={{ orderId: String(order.id) }}
                    className="hover:text-primary hover:underline"
                  >
                    {order.order_number || `#${order.id}`}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-foreground">
                  {orderAmount(order)}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge
                    label={humaniseStatus(order.admin_order_status || order.order_status)}
                  />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                  {formatDate(order.created_at)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/admin/orders/$orderId" params={{ orderId: String(order.id) }}>
                      View
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
      <MobileOrderList orders={orders} />
    </Panel>
  );
}

function RecentPayments({ payments }: { payments: Payment[] }) {
  return (
    <Panel title="Recent Payments">
      <TableScroll>
        <table className="w-full min-w-[620px] text-left">
          <thead>
            <tr className="border-b border-border">
              {["Payment", "Amount", "Status", "Date", ""].map((heading, index) => (
                <th
                  key={heading || `action-${index}`}
                  className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((payment) => {
              const badge = paymentBadge(payment);
              return (
                <tr key={String(payment.id)} className="transition-colors hover:bg-muted/40">
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-foreground">
                    <Link
                      to="/admin/payments/$paymentId"
                      params={{ paymentId: String(payment.id) }}
                      className="hover:text-primary hover:underline"
                    >
                      {payment.payment_reference || `Payment #${payment.id}`}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-foreground">
                    {paymentAmount(payment)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge {...badge} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                    {formatDate(payment.submitted_at ?? payment.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link
                        to="/admin/payments/$paymentId"
                        params={{ paymentId: String(payment.id) }}
                      >
                        View
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableScroll>
      <MobilePaymentList payments={payments} />
    </Panel>
  );
}

function RequestsPanel({ data }: { data: AdminUserDetail }) {
  const groups = [
    { label: "Tutor Requests", kind: "tutor" as const, rows: data.requests.tutor },
    { label: "Consulting Requests", kind: "consulting" as const, rows: data.requests.consulting },
    {
      label: "Procurement Requests",
      kind: "procurement" as const,
      rows: data.requests.procurement,
    },
  ].filter((group) => group.rows.length > 0);

  return (
    <Panel title="Requests">
      <div className="divide-y divide-border">
        {groups.map((group) => (
          <section key={group.kind} className="px-5 py-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.07em] text-muted-foreground">
              {group.label}
            </h3>
            <ul className="mt-3 space-y-3">
              {group.rows.map((request) => (
                <li
                  key={`${group.kind}-${recordId(request)}`}
                  className="flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {requestTitle(request, group.kind)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{requestMeta(request)}</p>
                  </div>
                  {recordId(request) ? (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        to={`/admin/requests/${group.kind}/$requestId`}
                        params={{ requestId: String(recordId(request)) }}
                      >
                        View
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Panel>
  );
}

function PurchasedResources({ resources }: { resources: Resource[] }) {
  return (
    <Panel title="Purchased Resources">
      <ul className="divide-y divide-border">
        {resources.map((resource) => {
          const resourceId = resource.id ?? fieldValue(resource, "resource_id");
          return (
            <li
              key={String(resourceId ?? resource.title)}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {resource.title || "Resource"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {resourceDate(resource)
                    ? `Granted ${formatDate(resourceDate(resource))}`
                    : "Access recorded"}
                </p>
              </div>
              {resourceId ? (
                <Button asChild variant="outline" size="sm">
                  <Link
                    to="/admin/resources/$resourceId"
                    params={{ resourceId: String(resourceId) }}
                  >
                    View resource
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function MobileOrderList({ orders }: { orders: Order[] }) {
  return (
    <ul className="divide-y divide-border md:hidden">
      {orders.map((order) => (
        <li key={String(order.id)} className="px-5 py-4">
          <p className="text-sm font-semibold text-foreground">
            {order.order_number || `#${order.id}`}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {orderAmount(order)} · {humaniseStatus(order.admin_order_status || order.order_status)}{" "}
            · {formatDate(order.created_at)}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3 w-full">
            <Link to="/admin/orders/$orderId" params={{ orderId: String(order.id) }}>
              View order
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </li>
      ))}
    </ul>
  );
}

function MobilePaymentList({ payments }: { payments: Payment[] }) {
  return (
    <ul className="divide-y divide-border md:hidden">
      {payments.map((payment) => (
        <li key={String(payment.id)} className="px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {payment.payment_reference || `Payment #${payment.id}`}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {paymentAmount(payment)} · {formatDate(payment.submitted_at ?? payment.created_at)}
              </p>
            </div>
            <StatusBadge {...paymentBadge(payment)} />
          </div>
          <Button asChild variant="outline" size="sm" className="mt-3 w-full">
            <Link to="/admin/payments/$paymentId" params={{ paymentId: String(payment.id) }}>
              View payment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </li>
      ))}
    </ul>
  );
}

function accountFields(user: AdminUser) {
  const fields: { label: string; value: ReactNode }[] = [
    { label: "Status", value: <StatusBadge {...accountStatusBadge(user)} /> },
    { label: "Display name", value: adminUserDisplayName(user) },
    { label: "First name", value: user.first_name },
    { label: "Last name", value: user.last_name },
    { label: "Email", value: user.email },
    { label: "User ID", value: `#${user.id}` },
    { label: "Joined", value: formatDateTime(adminUserJoinedAt(user)) },
  ];
  if (accountStatus(user) === "closed" && user.closed_at) {
    fields.splice(1, 0, { label: "Closed on", value: formatDateTime(user.closed_at) });
  }
  return fields.filter(
    (item) => item.value !== null && item.value !== undefined && item.value !== "",
  );
}

function accountStatus(user: AdminUser) {
  return user.account_status === "closed" ? "closed" : "active";
}

function accountStatusBadge(user: AdminUser) {
  return accountStatus(user) === "closed"
    ? { label: "Closed", tone: "danger" as const }
    : { label: "Active", tone: "success" as const };
}

function closeAccountError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      if (isAlreadyClosedError(error)) return "Customer account is already closed.";
      return "This account cannot be closed while it has active requests, orders, or payments.";
    }
    if (error.status === 403) {
      return "You do not have permission to close this account, or the selected user is not an eligible customer.";
    }
    if (error.status === 404) return "The customer account could not be found.";
    if (error.status === 422) return "Enter a valid reason for closure.";
  }
  return describeApiError(error, "Customer account could not be closed. Please try again.");
}

function isAlreadyClosedError(error: unknown) {
  return error instanceof ApiError && /already closed/i.test(error.message);
}

function profileFields(data: AdminUserDetail) {
  const merged = { ...data.profile };
  for (const key of [
    "profile_type",
    "phone",
    "organization_name",
    "exam_type",
    "exam_level",
    "institution",
    "country",
  ]) {
    const value = fieldValue(data.user, key);
    if (value !== undefined && value !== null && value !== "") merged[key] = value;
  }

  return PROFILE_FIELD_ORDER.filter((key) => !isSensitiveKey(key))
    .map((key) => ({ label: fieldLabel(key), value: formatProfileValue(key, merged[key]) }))
    .filter((item) => item.value !== null && item.value !== undefined && item.value !== "");
}

function summaryEntries(data: AdminUserDetail) {
  return Object.entries(data.summary)
    .filter(([, value]) => toNumber(value) > 0)
    .map(([key, value]) => ({
      key,
      label: SUMMARY_LABELS[key] ?? fieldLabel(key),
      value,
      icon: summaryIcon(key),
    }));
}

function hasAnyRequests(data: AdminUserDetail) {
  return (
    data.requests.tutor.length > 0 ||
    data.requests.consulting.length > 0 ||
    data.requests.procurement.length > 0
  );
}

function orderAmount(order: Order) {
  const amount = toNumber(order.total_price);
  return order.currency ? formatMoney(amount, order.currency) : amount.toLocaleString();
}

function paymentAmount(payment: Payment) {
  const amount = toNumber(payment.amount_paid);
  return payment.currency ? formatMoney(amount, payment.currency) : amount.toLocaleString();
}

function paymentBadge(payment: Payment) {
  if (payment.payment_status === "verified") return { label: "Approved", tone: "success" as const };
  if (payment.payment_status === "rejected") return { label: "Rejected", tone: "danger" as const };
  const reviewable = payment.payment_status === "pending" || payment.payment_status === "submitted";
  if (reviewable && payment.has_pop !== undefined && payment.has_pop !== null) {
    return toFlag(payment.has_pop)
      ? { label: "Awaiting approval", tone: "info" as const }
      : { label: "Pending", tone: "warning" as const };
  }
  if (reviewable) return { label: "Pending", tone: "warning" as const };
  return { label: humaniseStatus(payment.payment_status), tone: "neutral" as const };
}

function requestTitle(
  request: Record<string, unknown>,
  kind: "tutor" | "consulting" | "procurement",
) {
  return (
    firstString(
      request.title,
      request.subject,
      request.service_name,
      request.product_name_snapshot,
      request.exam_type,
      request.category,
    ) || `${humaniseStatus(kind)} request #${recordId(request) ?? ""}`.trim()
  );
}

function requestMeta(request: Record<string, unknown>) {
  const values = [
    firstString(request.status, request.request_status, request.admin_status),
    firstString(request.created_at, request.submitted_at, request.updated_at),
  ].filter((value): value is string => Boolean(value));
  return values
    .map((value, index) => (index === 0 ? humaniseStatus(value) : formatDate(value)))
    .join(" · ");
}

function recordId(record: Record<string, unknown>) {
  const id = record.id ?? record.request_id ?? record.procurement_id;
  return typeof id === "string" || typeof id === "number" ? id : null;
}

function resourceDate(resource: Resource) {
  const record = resource as unknown as Record<string, unknown>;
  return firstString(
    record.granted_at,
    record.purchased_at,
    record.created_at,
    resource.created_at,
  );
}

function fieldValue(record: object, key: string) {
  return (record as Record<string, unknown>)[key];
}

function firstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string" && value.trim() !== "");
}

function formatProfileValue(key: string, value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (key === "profile_type") return adminUserTypeLabel(String(value));
  if (key === "exam_level") return examLevelLabel(String(value));
  if (key.endsWith("_at") && typeof value === "string") return formatDateTime(value);
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return null;
}

function fieldLabel(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function isSensitiveKey(key: string) {
  const lowered = key.toLowerCase();
  return (
    lowered.includes("password") ||
    lowered.includes("token") ||
    lowered.includes("secret") ||
    lowered.includes("nonce") ||
    lowered.includes("capabil")
  );
}

function summaryIcon(key: string) {
  if (key.includes("payment")) return CreditCard;
  if (key.includes("resource")) return FileText;
  if (key.includes("request") || key.includes("procurement")) return UserRound;
  return ShoppingBag;
}
