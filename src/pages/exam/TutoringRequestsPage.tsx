import { useMemo, useState } from "react";
import { RoleLink } from "@/components/shared/RoleLink";
import { Search, Plus, GraduationCap, ArrowRight } from "lucide-react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTutorRequests } from "@/features/tutoring/hooks";
import { describeApiError } from "@/lib/api/errors";
import { formatDate } from "@/features/commerce/format";
import type { TutorRequest } from "@/features/tutoring/api";
import type { StatusTone } from "@/components/ui/status-badge";

/**
 * Rows come from GET /tutor-requests for the authenticated exam user. Search
 * filters the loaded page locally — it never calls the admin-only /search.
 */
const TUTORING_STATUSES = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Matched", value: "matched" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
] as const;

export function TutoringRequestsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const { data, isLoading, isError, error } = useTutorRequests(1, 50);
  const requests = useMemo(() => data?.requests ?? [], [data?.requests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesStatus = filter === "all" || request.status === filter;
      const matchesQuery =
        q.length === 0 ||
        referenceOf(request).toLowerCase().includes(q) ||
        `${request.exam_type} ${request.exam_level ?? ""}`.toLowerCase().includes(q) ||
        String(request.assigned_tutor_id ?? "")
          .toLowerCase()
          .includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [filter, query, requests]);

  const hasRequests = requests.length > 0;

  return (
    <AppShell>
      <PageHeader
        title="Tutoring requests"
        description="Sessions you have requested, with exam details and current status."
        actions={
          <Button asChild>
            <RoleLink to="/tutoring/new">
              <Plus className="h-4 w-4" strokeWidth={2} />
              New tutoring request
            </RoleLink>
          </Button>
        }
      />

      {hasRequests && (
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {TUTORING_STATUSES.map((item) => {
              const active = item.value === filter;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={
                    active
                      ? "whitespace-nowrap border border-primary bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
                      : "whitespace-nowrap border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.9}
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tutoring requests"
              aria-label="Search tutoring requests by reference, exam or tutor"
              className="h-10 pl-9"
            />
          </div>
        </div>
      )}

      <section className="border border-border bg-card">
        {isLoading ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">Loading tutoring requests…</p>
          </div>
        ) : isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">
              Tutoring requests could not be loaded
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {describeApiError(error, "Please try again in a moment.")}
            </p>
          </div>
        ) : !hasRequests ? (
          <div className="px-6 py-16 text-center">
            <GraduationCap className="mx-auto h-6 w-6 text-muted-foreground" strokeWidth={1.9} />
            <p className="mt-3 text-sm font-semibold text-foreground">No tutoring requests yet</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
              When you request a tutoring session, it will appear here with its exam details and
              scheduling status.
            </p>
            <Button asChild className="mt-5">
              <RoleLink to="/tutoring/new">
                <Plus className="h-4 w-4" strokeWidth={2} />
                Create your first request
              </RoleLink>
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">No matching tutoring requests</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Try a different status or search term.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-left lg:table">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Reference",
                    "Exam type",
                    "Level",
                    "Timezone",
                    "Language",
                    "Submitted",
                    "Tutor",
                    "Status",
                    "",
                  ].map((heading, index) => (
                    <th
                      key={heading || `action-${index}`}
                      scope="col"
                      className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((request) => {
                  const status = tutoringStatus(request.status);
                  return (
                    <tr key={request.id} className="transition-colors hover:bg-muted/40">
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-foreground">
                        {referenceOf(request)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-foreground">
                        {request.exam_type}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-foreground">
                        {request.exam_level || "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                        {request.preferred_timezone || "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                        {request.preferred_language || "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-foreground">
                        {request.assigned_tutor_id ? (
                          `#${request.assigned_tutor_id}`
                        ) : (
                          <span className="text-muted-foreground">Not yet assigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge label={status.label} tone={status.tone} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <Button asChild variant="outline" size="sm">
                          <RoleLink
                            to="/tutoring/$requestId"
                            params={{ requestId: String(request.id) }}
                          >
                            View details
                            <ArrowRight className="h-4 w-4" strokeWidth={2} />
                          </RoleLink>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile and tablet list */}
            <ul className="divide-y divide-border lg:hidden">
              {filtered.map((request) => {
                const status = tutoringStatus(request.status);
                return (
                  <li key={request.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {request.exam_type} · {request.exam_level || "—"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {referenceOf(request)} · Submitted {formatDate(request.created_at)}
                        </p>
                      </div>
                      <StatusBadge label={status.label} tone={status.tone} />
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="min-w-0">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                          Timezone
                        </dt>
                        <dd className="mt-0.5 truncate text-sm text-foreground">
                          {request.preferred_timezone || "—"}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                          Language
                        </dt>
                        <dd className="mt-0.5 truncate text-sm text-foreground">
                          {request.preferred_language || "—"}
                        </dd>
                      </div>
                      <div className="col-span-2 min-w-0">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                          Tutor
                        </dt>
                        <dd className="mt-0.5 truncate text-sm text-foreground">
                          {request.assigned_tutor_id ? (
                            `#${request.assigned_tutor_id}`
                          ) : (
                            <span className="text-muted-foreground">Not yet assigned</span>
                          )}
                        </dd>
                      </div>
                    </dl>

                    <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                      <RoleLink
                        to="/tutoring/$requestId"
                        params={{ requestId: String(request.id) }}
                      >
                        View details
                        <ArrowRight className="h-4 w-4" strokeWidth={2} />
                      </RoleLink>
                    </Button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </AppShell>
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
