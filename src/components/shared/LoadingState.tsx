import { Loader2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("h-5 w-5 animate-spin text-primary motion-reduce:animate-none", className)}
      strokeWidth={2}
      aria-hidden="true"
    />
  );
}

export function FullPageLoading({ message = "Loading your portal..." }: { message?: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <ContentLoading message={message} />
    </main>
  );
}

export function ContentLoading({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-center justify-center gap-2 text-sm text-muted-foreground", className)}
    >
      <LoadingSpinner />
      <span>{message}</span>
    </div>
  );
}

export function PanelLoading({ message }: { message: string }) {
  return (
    <div className="px-6 py-16">
      <ContentLoading message={message} />
    </div>
  );
}

export function DashboardSkeleton({ variant = "user" }: { variant?: "user" | "admin" }) {
  const statCount = variant === "admin" ? 4 : 4;
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading dashboard...</span>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: statCount }).map((_, index) => (
          <div key={index} className="border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-sm" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="mt-3 h-8 w-16" />
            {variant === "admin" ? <Skeleton className="mt-2 h-3 w-36" /> : null}
          </div>
        ))}
      </div>
      <section className="bg-accent-soft/70 p-5">
        <Skeleton className="h-4 w-32" />
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {Array.from({ length: variant === "admin" ? 3 : 1 }).map((_, index) => (
            <div key={index} className="bg-card px-4 py-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-3 w-56 max-w-full" />
            </div>
          ))}
        </div>
      </section>
      <section className="border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-3 w-48" />
        </div>
        <div className="space-y-4 px-5 py-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/3" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function TableLoading({
  columns = 5,
  rows = 5,
  minWidthClassName = "min-w-[760px]",
}: {
  columns?: number;
  rows?: number;
  minWidthClassName?: string;
}) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading table...</span>
      <div className="hidden overflow-hidden md:block">
        <table className={cn("w-full text-left", minWidthClassName)}>
          <thead>
            <tr className="border-b border-border">
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-5 py-3">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, columnIndex) => (
                  <td key={columnIndex} className="px-5 py-4">
                    <Skeleton className={columnIndex === 0 ? "h-4 w-28" : "h-4 w-20"} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-border md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <li key={index} className="px-5 py-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/2" />
            <Skeleton className="mt-3 h-8 w-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CardGridLoading({
  cards = 6,
  withMedia = false,
}: {
  cards?: number;
  withMedia?: boolean;
}) {
  return (
    <div role="status" aria-live="polite" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <span className="sr-only">Loading content...</span>
      {Array.from({ length: cards }).map((_, index) => (
        <article key={index} className="border border-border bg-card">
          {withMedia ? <Skeleton className="aspect-[4/3] rounded-none border-b border-border" /> : null}
          <div className="p-5">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="mt-4 h-4 w-3/4" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-2/3" />
            <Skeleton className="mt-5 h-9 w-full" />
          </div>
        </article>
      ))}
    </div>
  );
}

export function ListLoading({ rows = 5 }: { rows?: number }) {
  return (
    <ul role="status" aria-live="polite" className="divide-y divide-border">
      <span className="sr-only">Loading list...</span>
      {Array.from({ length: rows }).map((_, index) => (
        <li key={index} className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 gap-3">
              <Skeleton className="mt-1.5 h-2 w-2 rounded-full" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="mt-3 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-2/3" />
              </div>
            </div>
            <Skeleton className="h-8 w-28" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DetailPageLoading({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <>
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-8 w-56 max-w-full" />
        <span className="sr-only">{title}</span>
      </div>
      <section className="border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-4 w-40 max-w-full" />
            </div>
          ))}
        </div>
        <ContentLoading message={message} className="mt-8" />
      </section>
    </>
  );
}
