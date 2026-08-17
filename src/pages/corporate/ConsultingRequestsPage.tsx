import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { SectionCard, EmptyState } from "@/components/shared/DashboardCard";
import { StatusBadge } from "@/components/ui/status-badge";
import { describeApiError } from "@/lib/api/errors";
import { formatDate } from "@/features/commerce/format";
import { useConsultingRequests } from "@/features/corporate/hooks";
import type { StatusTone } from "@/components/ui/status-badge";

/**
 * Data source: GET /consulting-requests for the authenticated corporate user.
 * The page remains read-only because user-facing update actions are not
 * exposed by the backend contract.
 */
export function ConsultingRequestsPage() {
  const { data, isLoading, isError, error } = useConsultingRequests(1, 50);
  const requests = data?.requests ?? [];

  return (
    <AppShell>
      <PageHeader
        title="Consulting requests"
        description="Advisory and workshop engagements requested by your organisation."
      />

      <SectionCard
        title="All consulting requests"
        description="Requests are read-only until the backend exposes an update action."
        className="mt-6"
      >
        {isLoading ? (
          <EmptyState message="Loading consulting requests…" />
        ) : isError ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-semibold text-foreground">
              Consulting requests could not be loaded
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {describeApiError(error, "Please try again in a moment.")}
            </p>
          </div>
        ) : requests.length === 0 ? (
          <EmptyState message="You have not submitted a consulting request yet." />
        ) : (
          <ul className="divide-y divide-border">
            {requests.map((request) => {
              const status = consultingStatus(request.status);
              return (
                <li
                  key={request.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {request.service_type}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      CON-{String(request.id).padStart(4, "0")} ·{" "}
                      {request.organization_name || request.contact_person} · Submitted{" "}
                      {formatDate(request.created_at)}
                      {request.assigned_to ? ` · Assigned #${request.assigned_to}` : ""}
                    </p>
                  </div>
                  <StatusBadge label={status.label} tone={status.tone} />
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </AppShell>
  );
}

function consultingStatus(status: string): { label: string; tone: StatusTone } {
  const labels: Record<string, { label: string; tone: StatusTone }> = {
    pending: { label: "Pending", tone: "warning" },
    under_review: { label: "Under review", tone: "info" },
    assigned: { label: "Assigned", tone: "info" },
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
