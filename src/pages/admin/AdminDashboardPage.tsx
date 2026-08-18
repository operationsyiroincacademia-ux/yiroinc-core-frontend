import { EmptyState, SectionCard } from "@/components/shared/DashboardCard";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  formatDate,
  formatMoney,
  humaniseStatus,
  paymentBadge,
  toFlag,
  toNumber,
} from "@/features/commerce/format";
import { timelineText, timelineTime } from "@/features/dashboard/derive";
import { useAdminDashboard } from "@/features/admin/hooks";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";
import {
  Bell,
  BookOpen,
  Briefcase,
  CreditCard,
  GraduationCap,
  Package,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Admin dashboard home. Data comes from GET /admin/dashboard only.
 */
export function AdminDashboardPage() {
  const dashboard = useAdminDashboard();
  const data = dashboard.data;
  const summary = data?.summary;

  const summaryCards = summary
    ? [
        {
          label: "Users",
          value: toNumber(summary.users),
          detail: "Registered accounts",
          icon: Users,
        },
        {
          label: "Orders requiring attention",
          value: toNumber(summary.orders.under_review) + toNumber(summary.orders.processing),
          detail: `${toNumber(summary.orders.under_review)} under review · ${toNumber(
            summary.orders.processing,
          )} processing`,
          icon: ShoppingBag,
        },
        {
          label: "Payments awaiting verification",
          value: toNumber(summary.payments.awaiting_verification),
          detail: "Proof submitted for review",
          icon: CreditCard,
        },
        {
          label: "Resources",
          value: toNumber(summary.resources.total),
          detail: `${toNumber(summary.resources.free)} free · ${toNumber(
            summary.resources.paid,
          )} paid`,
          icon: BookOpen,
        },
      ]
    : [];

  const requestOverview = summary
    ? [
        {
          label: "Tutoring requests",
          value: toNumber(summary.pending_tutor_requests),
          icon: GraduationCap,
        },
        {
          label: "Consulting requests",
          value: toNumber(summary.pending_consulting_requests),
          icon: Briefcase,
        },
        {
          label: "Procurement requests",
          value: toNumber(summary.pending_procurements),
          icon: Package,
        },
      ]
    : [];

  const pendingPayments = data?.pending_payments.slice(0, 5) ?? [];
  const recentActivity = data?.recent_activity.slice(0, 5) ?? [];

  return (
    <AdminLayout>
      <PageHeader
        title="Admin Dashboard"
        description="Manage YiroInc Academia operations from the administrator workspace."
      />

      {dashboard.isLoading ? (
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </section>
      ) : dashboard.isError ? (
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm font-semibold text-foreground">Dashboard could not be loaded</p>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
            {describeApiError(dashboard.error, "Please try again in a moment.")}
          </p>
        </section>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((item) => (
              <SummaryCard key={item.label} {...item} />
            ))}
          </div>

          <section className="mt-6 bg-accent-soft/70 p-5">
            <h2 className="text-sm font-bold tracking-tight text-foreground">Request overview</h2>
            {requestOverview.length === 0 ? (
              <p className="mt-3 bg-card px-4 py-3 text-sm text-muted-foreground">
                No pending request data available.
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                {requestOverview.map((item) => (
                  <div key={item.label} className="bg-card px-4 py-3">
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <item.icon className="h-4 w-4" strokeWidth={1.9} />
                      <span className="text-xs font-semibold uppercase tracking-[0.07em]">
                        {item.label}
                      </span>
                    </div>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <SectionCard
              title="Payments awaiting verification"
              description="Payments with proof uploaded and ready for admin review."
            >
              {pendingPayments.length === 0 ? (
                <EmptyState message="No payments are awaiting verification." />
              ) : (
                <ul className="divide-y divide-border">
                  {pendingPayments.map((payment) => {
                    const badge = paymentBadge(payment.payment_status, toFlag(payment.has_pop));
                    return (
                      <li
                        key={String(payment.id)}
                        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {payment.payment_reference}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Order #{payment.order_id} · {paymentAmount(payment)} ·{" "}
                            {formatDate(payment.submitted_at ?? payment.created_at)}
                          </p>
                        </div>
                        <StatusBadge label={badge.label} tone={badge.tone} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </SectionCard>

            <SectionCard title="Recent activity" description="Latest administrative events.">
              {recentActivity.length === 0 ? (
                <EmptyState message="No activity recorded yet." />
              ) : (
                <ol className="space-y-4 px-5 py-4">
                  {recentActivity.map((entry) => (
                    <li key={String(entry.id)} className="relative pl-4">
                      <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-primary/40" />
                      <p className="text-sm text-foreground">{timelineText(entry)}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{timelineTime(entry)}</p>
                    </li>
                  ))}
                </ol>
              )}
            </SectionCard>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <article className="border border-border bg-card p-5">
      <div className="flex items-center gap-2.5 text-muted-foreground">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
        <span className="text-xs font-semibold uppercase tracking-[0.07em]">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </article>
  );
}

function paymentAmount(payment: { amount_paid: string | number; currency?: string | null }) {
  const amount = toNumber(payment.amount_paid);
  return payment.currency ? formatMoney(amount, payment.currency) : amount.toLocaleString();
}
