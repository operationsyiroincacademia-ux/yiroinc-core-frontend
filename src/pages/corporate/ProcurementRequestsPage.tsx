import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { SectionCard, EmptyState } from "@/components/shared/DashboardCard";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  PROCUREMENT_REQUESTS,
  PROCUREMENT_STATUS_LABEL,
  PROCUREMENT_STATUS_TONE,
} from "@/features/corporate/preview-data";

/**
 * PREVIEW DATA ONLY — visual stage.
 * Production source: GET /procurements.
 */
export function ProcurementRequestsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Procurement requests"
        description="Items and services procured on behalf of your organisation."
      />

      <SectionCard
        title="All procurement requests"
        description="Requests are read-only until the backend exposes an update action."
        className="mt-6"
      >
        {PROCUREMENT_REQUESTS.length === 0 ? (
          <EmptyState message="You have not submitted a procurement request yet." />
        ) : (
          <ul className="divide-y divide-border">
            {PROCUREMENT_REQUESTS.map((request) => (
              <li
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {request.item}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {request.reference} · {request.quantity} · Submitted{" "}
                    {request.submittedAt}
                  </p>
                </div>
                <StatusBadge
                  label={PROCUREMENT_STATUS_LABEL[request.status]}
                  tone={PROCUREMENT_STATUS_TONE[request.status]}
                />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </AppShell>
  );
}
