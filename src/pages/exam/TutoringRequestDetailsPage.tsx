import type { ReactNode } from "react";
import { useParams } from "@tanstack/react-router";
import { RoleLink } from "@/components/shared/RoleLink";
import { ArrowLeft, GraduationCap, MessageCircle } from "lucide-react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { useTutorRequest } from "@/features/tutoring/hooks";
import { useAuth } from "@/lib/auth/auth-context";
import { describeApiError } from "@/lib/api/errors";
import { formatDateTime } from "@/features/commerce/format";
import type { AssignedTutor, TutorRequest } from "@/features/tutoring/api";
import type { StatusTone } from "@/components/ui/status-badge";

/**
 * Data source: GET /tutor-requests/{id}. Tutor assignment and status
 * transitions are admin-only actions and are intentionally absent from this
 * user-facing page.
 */

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
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

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function Pending({ children }: { children: string }) {
  return <span className="text-muted-foreground">{children}</span>;
}

export function TutoringRequestDetailsPage() {
  const { requestId } = useParams({ strict: false }) as { requestId: string };
  const { data: request, isLoading, isError, error } = useTutorRequest(requestId);
  const { user } = useAuth();

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader
          title="Loading tutoring request"
          description="Retrieving the latest details for this request."
        />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Loading tutoring request…</p>
        </section>
      </AppShell>
    );
  }

  if (isError || !request) {
    return (
      <AppShell>
        <PageHeader
          title="Tutoring request not found"
          description="This request does not exist or is not available on your account."
        />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {describeApiError(
              error,
              "The tutoring request you are looking for could not be loaded.",
            )}
          </p>
          <Button asChild variant="outline" className="mt-5">
            <RoleLink to="/tutoring">Back to tutoring requests</RoleLink>
          </Button>
        </section>
      </AppShell>
    );
  }

  const timestamps: { label: string; value: string | null }[] = [
    { label: "Submitted", value: request.created_at ?? null },
    { label: "Matched with tutor", value: request.matched_at ?? null },
    { label: "Session started", value: request.session_started_at ?? null },
    { label: "Completed", value: request.completed_at ?? null },
  ];
  const status = tutoringStatus(request.status);
  const tutor = request.tutor;

  return (
    <AppShell>
      <RoleLink
        to="/tutoring"
        className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to tutoring requests
      </RoleLink>

      <PageHeader
        title={referenceOf(request)}
        description={`${request.exam_type} · ${request.exam_level || "—"}`}
        actions={<StatusBadge label={status.label} tone={status.tone} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Request summary">
            <dl className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
              <Field label="Reference" value={referenceOf(request)} />
              <Field label="Current status" value={status.label} />
              <Field label="Exam type" value={request.exam_type} />
              <Field label="Exam level" value={request.exam_level || "—"} />
              <Field label="Preferred timezone" value={request.preferred_timezone || "—"} />
              <Field label="Preferred language" value={request.preferred_language || "—"} />
            </dl>
            <div className="border-t border-border px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                Additional notes
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                {request.additional_notes || <Pending>No additional notes were provided.</Pending>}
              </p>
            </div>
          </Panel>

          <Panel title="Progress" description="Timestamps recorded for this request, as available.">
            <ul className="divide-y divide-border">
              {timestamps.map((item) => (
                <li
                  key={item.label}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.value ? formatDateTime(item.value) : "Not yet recorded"}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Your Tutor">
            <div className="px-5 py-5">
              {tutor ? (
                <TutorContact
                  tutor={tutor}
                  request={request}
                  candidateName={user?.name ?? "Candidate"}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  A tutor has not been assigned yet. You will be notified once your request is
                  matched.
                </p>
              )}
            </div>
          </Panel>

          <Panel title="Need another session?">
            <div className="px-5 py-5">
              <p className="text-sm text-muted-foreground">
                Submit a new tutoring request for a different exam type, level or schedule.
              </p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <RoleLink to="/tutoring/new">New tutoring request</RoleLink>
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function TutorContact({
  tutor,
  request,
  candidateName,
}: {
  tutor: AssignedTutor;
  request: TutorRequest;
  candidateName: string;
}) {
  const link = whatsappLink(tutor, request, candidateName);
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.9} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{tutor.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Matched {request.matched_at ? formatDateTime(request.matched_at) : "recently"}
          </p>
        </div>
      </div>
      <dl className="space-y-3">
        <TutorField label="Exam expertise" value={listText(tutor.exam_expertise)} />
        <TutorField label="Levels taught" value={listText(tutor.levels, levelLabel)} />
        <TutorField label="Timezone" value={tutor.timezone} />
        <TutorField label="Email" value={tutor.email} />
        {tutor.bio && <TutorField label="Bio" value={tutor.bio} />}
      </dl>
      {link && (
        <Button asChild className="w-full">
          <a href={link} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </Button>
      )}
    </div>
  );
}

function TutorField({ label, value }: { label: string; value: ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-relaxed text-foreground">{value}</dd>
    </div>
  );
}

function referenceOf(request: TutorRequest): string {
  return `TUT-${String(request.id).padStart(4, "0")}`;
}

function tutoringStatus(status: string): { label: string; tone: StatusTone } {
  const labels: Record<string, { label: string; tone: StatusTone }> = {
    pending: { label: "Pending", tone: "warning" },
    matched: { label: "Matched", tone: "info" },
    in_progress: { label: "In progress", tone: "info" },
    completed: { label: "Completed", tone: "success" },
    cancelled: { label: "Cancelled", tone: "neutral" },
  };
  return (
    labels[status] ?? {
      label: status ? status.replace(/_/g, " ") : "—",
      tone: "neutral",
    }
  );
}

function listText(value: unknown, format: (value: string) => string = (item) => item): string {
  const items = normalizeStringList(value).map(format);
  return items.length > 0 ? items.join(", ") : "";
}

function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
  }
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string => typeof item === "string" && item.trim() !== "",
      );
    }
  } catch {
    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function levelLabel(value: string): string {
  const labels: Record<string, string> = {
    level_1: "Level I",
    level_2: "Level II",
    level_3: "Level III",
    part_1: "Part I",
    part_2: "Part II",
  };
  return labels[value] ?? value;
}

function whatsappLink(tutor: AssignedTutor, request: TutorRequest, candidateName: string) {
  if (!tutor.whatsapp_number) return null;
  const phone = tutor.whatsapp_number.replace(/[^\d]/g, "");
  if (!phone) return null;
  const message = `Hi ${tutor.name}, I'm ${candidateName}. I've been matched with you through YiroInc Academia for ${request.exam_type}${request.exam_level ? ` ${request.exam_level}` : ""} tutoring.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
