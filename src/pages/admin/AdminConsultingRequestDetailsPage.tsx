import { useState, type ReactNode } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusTone } from "@/components/ui/status-badge";
import { formatDateTime, formatMoney, humaniseStatus, toNumber } from "@/features/commerce/format";
import {
  useAdminConsultingRequest,
  useCompleteAdminConsultingRequest,
  useStartAdminConsultingRequest,
} from "@/features/admin/hooks";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";

export function AdminConsultingRequestDetailsPage() {
  const { requestId } = useParams({ strict: false }) as { requestId: string };
  const { data, isLoading, isError, error } = useAdminConsultingRequest(requestId);
  const start = useStartAdminConsultingRequest(requestId);
  const complete = useCompleteAdminConsultingRequest(requestId);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) return <Loading />;
  if (isError || !data?.request) return <ErrorState error={error} />;

  const request = data.request;
  const badge = requestBadge(request.status);

  return (
    <AdminLayout>
      <BackLink />
      <PageHeader
        title={`Consulting request #${request.id}`}
        description={request.service_type}
        actions={<StatusBadge label={badge.label} tone={badge.tone} />}
      />
      {actionError && <ErrorBanner message={actionError} />}
      {(request.status === "assigned" || request.status === "in_progress") && (
        <section className="mb-6 flex flex-wrap gap-2 border border-border bg-card px-5 py-4">
          {request.status === "assigned" && (
            <Button
              type="button"
              disabled={start.isPending}
              onClick={() => {
                setActionError(null);
                start.mutate(undefined, {
                  onError: (err) =>
                    setActionError(describeApiError(err, "Request could not be started.")),
                });
              }}
            >
              <PlayCircle className="h-4 w-4" />
              Start request
            </Button>
          )}
          {request.status === "in_progress" && (
            <Button
              type="button"
              disabled={complete.isPending}
              onClick={() => {
                setActionError(null);
                complete.mutate(undefined, {
                  onError: (err) =>
                    setActionError(describeApiError(err, "Request could not be completed.")),
                });
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete request
            </Button>
          )}
        </section>
      )}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Request information">
            <Fields
              items={[
                ["Service", request.service_type],
                ["Organization", request.organization_name],
                ["Contact person", request.contact_person],
                ["Contact email", request.contact_email],
                ["Contact phone", request.contact_phone],
                ["Budget", request.budget ? formatMoney(toNumber(request.budget), "NGN") : null],
                ["Preferred date", request.preferred_date],
                ["Summary", request.project_summary],
                ["Created", date(request.created_at)],
                ["Updated", date(request.updated_at)],
              ]}
            />
          </Panel>
          <Panel title="Customer">
            <RecordFields
              record={data.customer}
              keys={["display_name", "name", "email", "phone"]}
            />
          </Panel>
          {data.timeline.length > 0 && (
            <Panel title="Timeline">
              <Timeline timeline={data.timeline} />
            </Panel>
          )}
        </div>
        <Panel title="Current status">
          <Fields
            items={[
              ["Status", <StatusBadge label={badge.label} tone={badge.tone} />],
              ["Assigned to", request.assigned_to ? `#${request.assigned_to}` : null],
              ["Assigned at", date(request.assigned_at)],
              ["Started at", date(request.started_at)],
              ["Completed at", date(request.completed_at)],
              ["Admin note", request.admin_note],
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
      <PageHeader title="Loading consulting request..." />
      <section className="border border-border bg-card px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">Loading request...</p>
      </section>
    </AdminLayout>
  );
}

function ErrorState({ error }: { error: unknown }) {
  return (
    <AdminLayout>
      <PageHeader
        title="Request not found"
        description="This admin request record is unavailable."
      />
      <section className="border border-border bg-card px-6 py-16 text-center">
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {describeApiError(error, "The request you are looking for could not be loaded.")}
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
  if (status === "completed") return { label: "Completed", tone: "success" };
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
