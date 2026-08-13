import type { ReactNode } from "react";
import { RoleLink } from "@/components/shared/RoleLink";

import { cn } from "@/lib/utils";

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
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
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
