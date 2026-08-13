import type { ReactNode } from "react";
import { useParams } from "@tanstack/react-router";
import { RoleLink } from "@/components/shared/RoleLink";
import { ArrowLeft, GraduationCap } from "lucide-react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { findTutoringRequest } from "@/features/tutoring/preview-data";

/**
 * Data source once the API layer is wired: the tutoring request detail
 * endpoint (single request by id). Values below are read from the tutoring
 * preview data module — nothing is hardcoded in this component. Tutor
 * assignment and status transitions are admin-only actions and are
 * intentionally absent from this user-facing page.
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
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
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
  const request = findTutoringRequest(Number(requestId));

  if (!request) {
    return (
      <AppShell>
        <PageHeader
          title="Tutoring request not found"
          description="This request does not exist or is not available on your account."
        />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            The tutoring request you are looking for could not be loaded.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <RoleLink to="/tutoring">Back to tutoring requests</RoleLink>
          </Button>
        </section>
      </AppShell>
    );
  }

  const timestamps: { label: string; value: string | null }[] = [
    { label: "Submitted", value: request.submittedAt },
    { label: "Matched with tutor", value: request.matchedAt },
    { label: "Session started", value: request.startedAt },
    { label: "Completed", value: request.completedAt },
  ];

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
        title={request.reference}
        description={`${request.examType} · ${request.examLevel}`}
        actions={<StatusBadge label={request.status} tone={request.tone} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Request summary">
            <dl className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
              <Field label="Reference" value={request.reference} />
              <Field label="Current status" value={request.status} />
              <Field label="Exam type" value={request.examType} />
              <Field label="Exam level" value={request.examLevel} />
              <Field label="Preferred timezone" value={request.timezone} />
              <Field label="Preferred language" value={request.language} />
            </dl>
            <div className="border-t border-border px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                Additional notes
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                {request.notes || (
                  <Pending>No additional notes were provided.</Pending>
                )}
              </p>
            </div>
          </Panel>

          <Panel
            title="Progress"
            description="Timestamps recorded for this request, as available."
          >
            <ul className="divide-y divide-border">
              {timestamps.map((item) => (
                <li
                  key={item.label}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.value ?? "Not yet recorded"}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Assigned tutor">
            <div className="px-5 py-5">
              {request.tutor ? (
                <div className="flex items-start gap-3">
                  <GraduationCap
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    strokeWidth={1.9}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {request.tutor}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Matched {request.matchedAt ?? "recently"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  A tutor has not been assigned yet. You will be notified once your
                  request is matched.
                </p>
              )}
            </div>
          </Panel>

          <Panel title="Need another session?">
            <div className="px-5 py-5">
              <p className="text-sm text-muted-foreground">
                Submit a new tutoring request for a different exam type, level or
                schedule.
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
