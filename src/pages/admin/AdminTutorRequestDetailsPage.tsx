import { useState, type ReactNode } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, PlayCircle, RefreshCw, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { formatDateTime, humaniseStatus } from "@/features/commerce/format";
import {
  useAdminTutorRequest,
  useAdminTutors,
  useCompleteAdminTutorRequest,
  useMatchAdminTutorRequest,
  useStartAdminTutorRequest,
} from "@/features/admin/hooks";
import type { AdminTutor } from "@/features/admin/api";
import {
  availabilityBadge,
  expertiseText,
  levelsText,
  statusBadge,
} from "@/features/admin/tutor-format";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";

export function AdminTutorRequestDetailsPage() {
  const { requestId } = useParams({ strict: false }) as { requestId: string };
  const { data, isLoading, isError, error } = useAdminTutorRequest(requestId);
  const start = useStartAdminTutorRequest(requestId);
  const complete = useCompleteAdminTutorRequest(requestId);
  const matchTutor = useMatchAdminTutorRequest(requestId);
  const [actionError, setActionError] = useState<string | null>(null);
  const [matchOpen, setMatchOpen] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState<string | number | null>(null);
  const loadedRequest = data?.request;
  const candidateQuery = useAdminTutors(
    {
      status: "active",
      availability: "available",
      examExpertise: loadedRequest?.exam_type || undefined,
      level: requestLevelParam(loadedRequest?.exam_level),
      page: 1,
      perPage: 50,
    },
    matchOpen && Boolean(loadedRequest),
  );

  if (isLoading) return <Loading title="Loading tutor request..." />;
  if (isError || !data?.request) return <ErrorState error={error} />;

  const request = data.request;
  const badge = requestBadge(request.status);
  const assignedTutor = data.tutor;
  const canMatch = !assignedTutor && request.status === "pending";
  const canReassign = Boolean(assignedTutor) && request.status === "matched";

  return (
    <AdminLayout>
      <BackLink />
      <PageHeader
        title={`Tutor request #${request.id}`}
        description={request.exam_type}
        actions={<StatusBadge label={badge.label} tone={badge.tone} />}
      />
      {actionError && <ErrorBanner message={actionError} />}
      {(canMatch ||
        canReassign ||
        request.status === "matched" ||
        request.status === "in_progress") && (
        <section className="mb-6 flex flex-wrap gap-2 border border-border bg-card px-5 py-4">
          {(canMatch || canReassign) && (
            <Button
              type="button"
              variant={canReassign ? "outline" : "default"}
              onClick={() => {
                setActionError(null);
                setSelectedTutorId(assignedTutor?.id ?? null);
                setMatchOpen(true);
              }}
            >
              {canReassign ? <RefreshCw className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {canReassign ? "Change tutor" : "Match tutor"}
            </Button>
          )}
          {request.status === "matched" && (
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
      <DetailGrid
        main={
          <>
            <Panel title="Request information">
              <Fields
                items={[
                  ["Exam type", request.exam_type],
                  ["Exam level", request.exam_level],
                  ["Timezone", request.preferred_timezone],
                  ["Language", request.preferred_language],
                  ["Notes", request.additional_notes],
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
            {assignedTutor && (
              <Panel title="Tutor">
                <TutorFields tutor={assignedTutor} />
              </Panel>
            )}
            {data.timeline.length > 0 && (
              <Panel title="Timeline">
                <Timeline timeline={data.timeline} />
              </Panel>
            )}
          </>
        }
        side={
          <Panel title="Current status">
            <Fields
              items={[
                ["Status", <StatusBadge label={badge.label} tone={badge.tone} />],
                [
                  "Assigned tutor",
                  assignedTutor?.id ? (
                    <Link
                      to="/admin/tutors/$tutorId"
                      params={{ tutorId: String(assignedTutor.id) }}
                      className="font-semibold text-primary hover:underline"
                    >
                      {assignedTutor.name}
                    </Link>
                  ) : request.assigned_tutor_id ? (
                    `#${request.assigned_tutor_id}`
                  ) : null,
                ],
                ["Matched at", date(request.matched_at)],
                ["Started at", date(request.session_started_at)],
                ["Completed at", date(request.completed_at)],
              ]}
            />
          </Panel>
        }
      />

      <Dialog open={matchOpen} onOpenChange={setMatchOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{canReassign ? "Change tutor" : "Match tutor"}</DialogTitle>
            <DialogDescription>
              Select an active, available tutor for this candidate request.
            </DialogDescription>
          </DialogHeader>

          {candidateQuery.isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading tutors...</p>
          ) : candidateQuery.isError ? (
            <p className="py-8 text-center text-sm text-danger">
              {describeApiError(candidateQuery.error, "Tutors could not be loaded.")}
            </p>
          ) : (candidateQuery.data?.tutors ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No suitable active and available tutors were returned.
            </p>
          ) : (
            <div className="max-h-[420px] space-y-2 overflow-y-auto">
              {(candidateQuery.data?.tutors ?? []).map((tutor) => {
                const active = String(selectedTutorId ?? "") === String(tutor.id);
                return (
                  <button
                    key={String(tutor.id)}
                    type="button"
                    onClick={() => setSelectedTutorId(tutor.id)}
                    className={
                      active
                        ? "w-full border border-primary bg-primary/5 px-4 py-3 text-left"
                        : "w-full border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/60"
                    }
                  >
                    <span className="block text-sm font-semibold text-foreground">
                      {tutor.name}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {expertiseText(tutor)} · {levelsText(tutor)} ·{" "}
                      {tutor.timezone ?? "No timezone"}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge {...availabilityBadge(tutor.availability)} />
                      <StatusBadge {...statusBadge(tutor.status)} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {actionError && <p className="text-sm font-semibold text-danger">{actionError}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={matchTutor.isPending}
              onClick={() => setMatchOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!selectedTutorId || matchTutor.isPending}
              onClick={() => {
                if (!selectedTutorId) return;
                setActionError(null);
                matchTutor.mutate(selectedTutorId, {
                  onSuccess: () => setMatchOpen(false),
                  onError: (err) =>
                    setActionError(describeApiError(err, "Tutor could not be matched.")),
                });
              }}
            >
              {matchTutor.isPending ? "Saving..." : canReassign ? "Change tutor" : "Match tutor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function Loading({ title }: { title: string }) {
  return (
    <AdminLayout>
      <PageHeader title={title} />
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

function DetailGrid({ main, side }: { main: ReactNode; side: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">{main}</div>
      {side}
    </div>
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

function TutorFields({ tutor }: { tutor: AdminTutor }) {
  return (
    <Fields
      items={[
        [
          "Name",
          tutor.id ? (
            <Link
              to="/admin/tutors/$tutorId"
              params={{ tutorId: String(tutor.id) }}
              className="font-semibold text-primary hover:underline"
            >
              {tutor.name}
            </Link>
          ) : (
            tutor.name
          ),
        ],
        ["Email", tutor.email],
        ["WhatsApp number", tutor.whatsapp_number],
        ["Exam expertise", expertiseText(tutor)],
        ["Levels", levelsText(tutor)],
        ["Timezone", tutor.timezone],
        ["Availability", <StatusBadge {...availabilityBadge(tutor.availability)} />],
        ["Status", <StatusBadge {...statusBadge(tutor.status)} />],
      ]}
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

function requestLevelParam(level: string | null | undefined) {
  const normalized = String(level ?? "")
    .toLowerCase()
    .replace(/\s+/g, "_");
  const aliases: Record<string, string> = {
    level_i: "level_1",
    level_ii: "level_2",
    level_iii: "level_3",
    part_i: "part_1",
    part_ii: "part_2",
  };
  return aliases[normalized] ?? (normalized || undefined);
}

function timelineTime(entry: unknown) {
  if (!entry || typeof entry !== "object") return null;
  const record = entry as Record<string, unknown>;
  const value = record.created_at ?? record.timestamp ?? record.date;
  return typeof value === "string" ? formatDateTime(value) : null;
}
