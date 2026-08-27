import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { RoleLink } from "@/components/shared/RoleLink";

import { cn } from "@/lib/utils";

const statIconToneByLabel: Record<string, string> = {
  "active orders": "bg-info-soft text-info",
  "pending payments": "bg-success-soft text-success",
  "tutoring requests": "bg-purple-50 text-purple-700",
  "unread notifications": "bg-warning-soft text-warning",
};

function statIconTone(label: string) {
  return statIconToneByLabel[label.toLowerCase()] ?? "bg-primary-soft text-primary";
}

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  to,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  to: string;
}) {
  return (
    <RoleLink
      to={to}
      className="border border-border bg-card p-4 transition-colors hover:border-primary/30 sm:p-5"
    >
      <div className="flex items-center gap-3 text-muted-foreground">
        <span
          className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-sm", statIconTone(label))}
        >
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <span className="min-w-0 text-xs font-semibold uppercase leading-snug tracking-[0.07em]">
          {label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:mt-3 sm:text-3xl">
        {value}
      </p>
    </RoleLink>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: { label: string; to: string };
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-border bg-card", className)}>
      <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-sm font-bold tracking-tight text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action && (
          <RoleLink
            to={action.to}
            className="shrink-0 text-xs font-semibold text-primary hover:underline"
          >
            {action.label}
          </RoleLink>
        )}
      </header>
      {children}
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="px-5 py-8 text-center text-sm text-muted-foreground">{message}</p>;
}
