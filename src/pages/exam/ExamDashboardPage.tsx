import { RoleLink } from "@/components/shared/RoleLink";
import { ShoppingBag, CreditCard, Bell, GraduationCap, ArrowRight, Upload } from "lucide-react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { SectionCard, EmptyState } from "@/components/shared/DashboardCard";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/auth/current-user";
import { useExamDashboard } from "@/features/dashboard/hooks";
import { describeApiError } from "@/lib/api/errors";
import {
  countActiveOrders,
  countPendingPayments,
  countUnreadNotifications,
  findOrderNeedingProof,
  orderAmount,
  timelineText,
  timelineTime,
} from "@/features/dashboard/derive";

export function ExamDashboardPage() {
  const user = useCurrentUser();
  const firstName = user.displayName.split(" ")[0];
  const dashboard = useExamDashboard();
  const data = dashboard.data;
  const proofOrder = data ? findOrderNeedingProof(data.orders) : null;
  const summary = data
    ? [
        {
          label: "Active orders",
          value: countActiveOrders(data.orders),
          icon: ShoppingBag,
          to: "/orders",
        },
        {
          label: "Pending payments",
          value: countPendingPayments(data.orders),
          icon: CreditCard,
          to: "/payments",
        },
        {
          label: "Tutoring requests",
          value: data.tutor_requests.length,
          icon: GraduationCap,
          to: "/tutoring",
        },
        {
          label: "Unread notifications",
          value: countUnreadNotifications(data.notifications),
          icon: Bell,
          to: "/notifications",
        },
      ]
    : [];
  const nextActions = proofOrder
    ? [
        {
          title: "Upload proof of payment",
          detail: `${proofOrder.order_number} · ${orderAmount(proofOrder)} is awaiting your receipt.`,
          cta: "Upload proof",
          to: `/checkout/${proofOrder.id}`,
          icon: Upload,
        },
      ]
    : [];
  const activity = data?.timeline.slice(0, 4) ?? [];

  return (
    <AppShell>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Your exam preparation orders, payments and tutoring requests."
        actions={
          <Button asChild>
            <RoleLink to="/tutoring/new">
              New tutoring request
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </RoleLink>
          </Button>
        }
      />

      {dashboard.isLoading ? (
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
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
            {summary.map((item) => (
              <RoleLink
                key={item.label}
                to={item.to}
                className="border border-border bg-card p-5 transition-colors hover:border-primary/30"
              >
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <item.icon className="h-4 w-4" strokeWidth={1.9} />
                  <span className="text-xs font-semibold uppercase tracking-[0.07em]">
                    {item.label}
                  </span>
                </div>
                <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
                  {item.value}
                </p>
              </RoleLink>
            ))}
          </div>

          <section className="mt-6 bg-accent-soft/70 p-5">
            <h2 className="text-sm font-bold tracking-tight text-foreground">Next actions</h2>
            {nextActions.length === 0 ? (
              <p className="mt-3 bg-card px-4 py-3 text-sm text-muted-foreground">
                No pending actions right now.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {nextActions.map((action) => (
                  <li
                    key={action.title}
                    className="flex flex-wrap items-center justify-between gap-3 bg-card px-4 py-3"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <action.icon
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                        strokeWidth={1.9}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{action.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{action.detail}</p>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <RoleLink to={action.to}>{action.cta}</RoleLink>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="mt-6 grid grid-cols-1 gap-6">
            <SectionCard title="Recent activity" description="Latest updates on your account.">
              {activity.length === 0 ? (
                <EmptyState message="No activity recorded yet." />
              ) : (
                <ol className="space-y-4 px-5 py-4">
                  {activity.map((entry) => (
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
    </AppShell>
  );
}
