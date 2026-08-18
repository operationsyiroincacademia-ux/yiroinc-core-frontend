import { useState, type ReactNode } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusTone } from "@/components/ui/status-badge";
import { formatDateTime, humaniseStatus } from "@/features/commerce/format";
import { useAdminProcurement, useDeliverAdminProcurement } from "@/features/admin/hooks";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";

export function AdminProcurementDetailsPage() {
  const { requestId } = useParams({ strict: false }) as { requestId: string };
  const { data, isLoading, isError, error } = useAdminProcurement(requestId);
  const deliver = useDeliverAdminProcurement(requestId);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) return <Loading />;
  if (isError || !data?.procurement) return <ErrorState error={error} />;

  const procurement = data.procurement;
  const badge = requestBadge(procurement.status);

  return (
    <AdminLayout>
      <BackLink />
      <PageHeader
        title={procurement.procurement_reference}
        description={`Order #${procurement.order_id}`}
        actions={<StatusBadge label={badge.label} tone={badge.tone} />}
      />
      {actionError && <ErrorBanner message={actionError} />}
      {procurement.status === "shipped" && (
        <section className="mb-6 flex flex-wrap gap-2 border border-border bg-card px-5 py-4">
          <Button
            type="button"
            disabled={deliver.isPending}
            onClick={() => {
              setActionError(null);
              deliver.mutate(undefined, {
                onError: (err) =>
                  setActionError(describeApiError(err, "Procurement could not be delivered.")),
              });
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark delivered
          </Button>
        </section>
      )}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Procurement information">
            <Fields
              items={[
                ["Reference", procurement.procurement_reference],
                ["Status", <StatusBadge label={badge.label} tone={badge.tone} />],
                ["Supplier", procurement.supplier_name],
                ["Expected delivery", procurement.expected_delivery_date],
                ["Created", date(procurement.created_at)],
                ["Updated", date(procurement.updated_at)],
                ["Admin note", procurement.admin_note],
              ]}
            />
          </Panel>
          <Panel title="Customer">
            <RecordFields
              record={data.customer}
              keys={["display_name", "name", "email", "phone"]}
            />
          </Panel>
          <Panel title="Tracking / courier">
            <Fields
              items={[
                ["Courier", procurement.courier],
                ["Tracking number", procurement.tracking_number],
                ["Ordered at", date(procurement.ordered_at)],
                ["Shipped at", date(procurement.shipped_at)],
                ["Delivered at", date(procurement.delivered_at)],
              ]}
            />
          </Panel>
          {data.timeline.length > 0 && (
            <Panel title="Timeline">
              <Timeline timeline={data.timeline} />
            </Panel>
          )}
        </div>
        <Panel title="Associated order">
          <Fields
            items={[
              ["Order", `#${procurement.order_id}`],
              ["Order number", scalar(data.order?.order_number)],
              ["Product", scalar(data.order?.product_name_snapshot)],
              [
                "Order status",
                data.order?.order_status ? humaniseStatus(String(data.order.order_status)) : null,
              ],
            ]}
          />
        </Panel>
      </div>
    </AdminLayout>
  );
}

function Loading() {
  return (
    <AdminLayout>
      <PageHeader title="Loading procurement..." />
      <section className="border border-border bg-card px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">Loading procurement...</p>
      </section>
    </AdminLayout>
  );
}

function ErrorState({ error }: { error: unknown }) {
  return (
    <AdminLayout>
      <PageHeader
        title="Procurement not found"
        description="This admin request record is unavailable."
      />
      <section className="border border-border bg-card px-6 py-16 text-center">
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {describeApiError(error, "The procurement you are looking for could not be loaded.")}
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link to="/admin/requests">Back to requests</Link>
        </Button>
      </section>
    </AdminLayout>
  );
}

function BackLink() {
  return (
    <Link
      to="/admin/requests"
      className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to requests
    </Link>
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

function Fields({ items }: { items: [string, ReactNode][] }) {
  const rows = items.filter(([, value]) => value !== null && value !== undefined && value !== "");
  if (rows.length === 0) {
    return <p className="px-5 py-5 text-sm text-muted-foreground">No details were returned.</p>;
  }
  return (
    <dl className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
            {label}
          </dt>
          <dd className="mt-1 text-sm text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function RecordFields({
  record,
  keys,
}: {
  record: Record<string, unknown> | null;
  keys: string[];
}) {
  if (!record) return <Fields items={[]} />;
  return (
    <Fields
      items={keys.map((key) => [humaniseStatus(key), scalar(record[key])]) as [string, ReactNode][]}
    />
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

function ErrorBanner({ message }: { message: string }) {
  return (
    <section className="mb-6 bg-danger-soft px-5 py-4">
      <p className="text-sm font-semibold text-danger">{message}</p>
    </section>
  );
}

function requestBadge(status: string): { label: string; tone: StatusTone } {
  if (status === "delivered") return { label: "Delivered", tone: "success" };
  if (status === "cancelled") return { label: "Cancelled", tone: "neutral" };
  if (status === "pending") return { label: "Pending", tone: "warning" };
  return { label: humaniseStatus(status), tone: "info" };
}

function date(value: string | null | undefined) {
  return value ? formatDateTime(value) : null;
}

function scalar(value: unknown) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? value
    : null;
}

function timelineText(entry: unknown) {
  if (typeof entry === "string") return entry;
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
