import {
  ShoppingBag,
  CreditCard,
  Bell,
  Briefcase,
  Package,
  ArrowRight,
  Upload,
} from "lucide-react";

import { RoleLink } from "@/components/shared/RoleLink";
import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { SectionCard, EmptyState } from "@/components/shared/DashboardCard";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/auth/current-user";
import { CONSULTING_REQUESTS } from "@/features/corporate/preview-data";

/**
 * PREVIEW DATA ONLY — visual stage.
 *
 * Production data sources:
 * - orders:        GET /orders
 * - payments:      GET /payments
 * - notifications: GET /notifications
 * - consulting:    GET /dashboard/corporate
 * - procurements:  GET /procurements
 */
const summary = [
  { label: "Active orders", value: 3, icon: ShoppingBag, to: "/orders" },
  { label: "Pending payments", value: 2, icon: CreditCard, to: "/payments" },
  {
    label: "Consulting requests",
    value: CONSULTING_REQUESTS.length,
    icon: Briefcase,
    to: "/orders",
  },
  { label: "Unread notifications", value: 2, icon: Bell, to: "/notifications" },
];

const nextActions = [
  {
    title: "Upload proof of payment",
    detail: "Payment PMT-2087 is recorded but has no proof attached.",
    cta: "Upload proof",
    to: "/payments",
    icon: Upload,
  },
  {
    title: "View consulting request",
    detail: "CON-2026-0019 is in progress.",
    cta: "View request",
    to: "/orders",
    icon: Briefcase,
  },
  {
    title: "View procurement request",
    detail: "PRC-2026-0088 has been ordered.",
    cta: "View request",
    to: "/orders",
    icon: Package,
  },
];

const activity = [
  { text: "Procurement request PRC-2026-0088 submitted", time: "27 Jul 2026" },
  { text: "Order ORD-2026-1192 placed", time: "27 Jul 2026" },
  { text: "Consulting request CON-2026-0031 submitted", time: "28 Jul 2026" },
  { text: "Proof of payment uploaded for PMT-2074", time: "16 Jul 2026" },
];

export function CorporateDashboardPage() {
  const user = useCurrentUser();
  const firstName = user.displayName.split(" ")[0];

  return (
    <AppShell>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Your organisation's orders, payments, consulting and procurement requests."
        actions={
          <Button asChild>
            <RoleLink to="/orders">
              New order
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </RoleLink>
          </Button>
        }
      />

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

      {nextActions.length > 0 && (
        <section className="mt-6 bg-accent-soft/70 p-5">
          <h2 className="text-sm font-bold tracking-tight text-foreground">
            Next actions
          </h2>
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
                    <p className="text-sm font-semibold text-foreground">
                      {action.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {action.detail}
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <RoleLink to={action.to}>{action.cta}</RoleLink>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6">
        <SectionCard
          title="Recent activity"
          description="Latest updates on your account."
        >
          {activity.length === 0 ? (
            <EmptyState message="No activity recorded yet." />
          ) : (
            <ol className="space-y-4 px-5 py-4">
              {activity.map((entry) => (
                <li key={entry.text} className="relative pl-4">
                  <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-primary/40" />
                  <p className="text-sm text-foreground">{entry.text}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{entry.time}</p>
                </li>
              ))}
            </ol>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
