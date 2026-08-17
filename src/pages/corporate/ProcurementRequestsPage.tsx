import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { SectionCard, EmptyState } from "@/components/shared/DashboardCard";
import { StatusBadge } from "@/components/ui/status-badge";
import { describeApiError } from "@/lib/api/errors";
import { formatDate } from "@/features/commerce/format";
import { useProcurements } from "@/features/corporate/hooks";
import type { StatusTone } from "@/components/ui/status-badge";

/**
 * Data source: GET /procurements for the authenticated corporate user. The
 * page remains read-only because user-facing update actions are not exposed by
 * the backend contract.
 */
export function ProcurementRequestsPage() {
  const { data, isLoading, isError, error } = useProcurements(1, 50);
  const procurements = data?.procurements ?? [];

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
        {isLoading ? (
          <EmptyState message="Loading procurement requests…" />
        ) : isError ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-semibold text-foreground">
              Procurement requests could not be loaded
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {describeApiError(error, "Please try again in a moment.")}
            </p>
          </div>
        ) : procurements.length === 0 ? (
          <EmptyState message="You have not submitted a procurement request yet." />
        ) : (
          <ul className="divide-y divide-border">
            {procurements.map((request) => {
              const status = procurementStatus(request.status);
              return (
                <li
                  key={request.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {request.procurement_reference}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Order #{request.order_id} · Submitted {formatDate(request.created_at)}
                      {request.expected_delivery_date
                        ? ` · Expected ${formatDate(request.expected_delivery_date)}`
                        : ""}
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

function procurementStatus(status: string): { label: string; tone: StatusTone } {
  const labels: Record<string, { label: string; tone: StatusTone }> = {
    pending: { label: "Pending", tone: "warning" },
    sourcing: { label: "Sourcing", tone: "info" },
    ordered: { label: "Ordered", tone: "info" },
    shipped: { label: "Shipped", tone: "info" },
    delivered: { label: "Delivered", tone: "success" },
    cancelled: { label: "Cancelled", tone: "neutral" },
  };
  return (
    labels[status] ?? {
      label: status ? status.replace(/_/g, " ") : "—",
      tone: "neutral",
    }
  );
}
