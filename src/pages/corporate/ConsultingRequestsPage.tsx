import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { SectionCard, EmptyState } from "@/components/shared/DashboardCard";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  CONSULTING_REQUESTS,
  CONSULTING_STATUS_LABEL,
  CONSULTING_STATUS_TONE,
} from "@/features/corporate/preview-data";

/**
 * PREVIEW DATA ONLY — visual stage.
 * Production source: GET /dashboard/corporate (consulting requests).
 */
export function ConsultingRequestsPage() {
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
        {CONSULTING_REQUESTS.length === 0 ? (
          <EmptyState message="You have not submitted a consulting request yet." />
        ) : (
          <ul className="divide-y divide-border">
            {CONSULTING_REQUESTS.map((request) => (
              <li
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {request.service}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {request.reference} · {request.engagement} · Submitted{" "}
                    {request.submittedAt}
                    {request.consultant ? ` · ${request.consultant}` : ""}
                  </p>
                </div>
                <StatusBadge
                  label={CONSULTING_STATUS_LABEL[request.status]}
                  tone={CONSULTING_STATUS_TONE[request.status]}
                />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </AppShell>
  );
}
