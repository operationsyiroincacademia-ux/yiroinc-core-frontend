import { useMemo, useState } from "react";
import { Bell, Check, CheckCheck, ExternalLink, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/button-loading";
import { isRead, type Notification } from "@/features/notifications/api";
import {
  useDismissNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/features/notifications/hooks";
import { describeApiError } from "@/lib/api/errors";
import { formatDateTime, humaniseStatus } from "@/features/commerce/format";
import { roleHref, useExperience } from "@/lib/roles/experience-context";
import type { Experience } from "@/lib/roles";

const FILTERS = ["All", "Unread", "Read"] as const;

/**
 * Served by the Notifications API: GET /notifications plus the read,
 * read-all and dismiss PATCH endpoints. Notifications are user-specific.
 */
export function NotificationsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [activeNotificationAction, setActiveNotificationAction] = useState<string | null>(null);
  const navigate = useNavigate();
  const experience = useExperience();
  const { data, isLoading, isError, error } = useNotifications(1, 50);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const dismiss = useDismissNotification();

  const items: Notification[] = useMemo(() => data?.notifications ?? [], [data]);
  const unreadCount = items.filter((item) => !isRead(item)).length;

  const filtered = useMemo(() => {
    if (filter === "Unread") return items.filter((item) => !isRead(item));
    if (filter === "Read") return items.filter((item) => isRead(item));
    return items;
  }, [items, filter]);

  const hasNotifications = items.length > 0;

  return (
    <AppShell>
      <PageHeader
        title="Notifications"
        description="Updates on your orders, payments and resources."
      />

      {hasNotifications && (
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {FILTERS.map((item) => {
              const active = item === filter;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={
                    active
                      ? "whitespace-nowrap border border-primary bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
                      : "whitespace-nowrap border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  }
                >
                  {item}
                  {item === "Unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            aria-busy={markAllRead.isPending}
            onClick={() =>
              markAllRead.mutate(undefined, {
                onSuccess: () => toast.success("All notifications marked as read."),
                onError: (err) =>
                  toast.error(describeApiError(err, "Notifications could not be updated.")),
              })
            }
            disabled={unreadCount === 0 || markAllRead.isPending}
          >
            {markAllRead.isPending ? (
              <ButtonLoading>Marking...</ButtonLoading>
            ) : (
              <>
                <CheckCheck className="h-4 w-4" strokeWidth={2} />
                Mark all as read
              </>
            )}
          </Button>
        </div>
      )}

      {isLoading ? (
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Loading notifications…</p>
        </section>
      ) : isError ? (
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm font-semibold text-foreground">Notifications could not be loaded</p>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
            {describeApiError(error, "Please try again in a moment.")}
          </p>
        </section>
      ) : !hasNotifications ? (
        <section className="border border-border bg-card px-6 py-16 text-center">
          <Bell className="mx-auto h-6 w-6 text-muted-foreground" strokeWidth={1.7} />
          <p className="mt-3 text-sm font-semibold text-foreground">No notifications</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            Updates about your orders, payments and resources will appear here.
          </p>
        </section>
      ) : filtered.length === 0 ? (
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm font-semibold text-foreground">Nothing to show</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {filter === "Unread"
              ? "You have read every notification."
              : "No read notifications yet."}
          </p>
        </section>
      ) : (
        <ul className="border border-border bg-card">
          {filtered.map((item, index) => {
            const read = isRead(item);
            const category = item.type ? humaniseStatus(item.type) : null;
            const actionHref = resolveNotificationAction(item.action_url, experience);
            return (
              <li
                key={String(item.id)}
                className={
                  index === 0
                    ? "flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
                    : "flex flex-col gap-3 border-t border-border p-5 sm:flex-row sm:items-start sm:justify-between"
                }
              >
                <div className="flex min-w-0 gap-3">
                  <span
                    aria-hidden
                    className={
                      read
                        ? "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-transparent"
                        : "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    }
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2
                        className={
                          read
                            ? "text-sm font-medium text-foreground"
                            : "text-sm font-bold tracking-tight text-foreground"
                        }
                      >
                        {item.title}
                      </h2>
                      {category && <StatusBadge label={category} tone="neutral" />}
                      {!read && (
                        <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-accent">
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {item.message}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDateTime(item.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:pl-4">
                  {actionHref && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate({ to: actionHref })}
                      aria-label={`Open "${item.title}"`}
                    >
                      <ExternalLink className="h-4 w-4" strokeWidth={2} />
                      Open
                    </Button>
                  )}
                  {!read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveNotificationAction(`read-${item.id}`);
                        markRead.mutate(item.id, {
                          onSuccess: () => toast.success("Notification marked as read."),
                          onError: (err) =>
                            toast.error(
                              describeApiError(err, "Notification could not be marked as read."),
                            ),
                          onSettled: () => setActiveNotificationAction(null),
                        });
                      }}
                      disabled={markRead.isPending}
                      aria-busy={activeNotificationAction === `read-${item.id}`}
                      aria-label={`Mark "${item.title}" as read`}
                    >
                      {activeNotificationAction === `read-${item.id}` ? (
                        <ButtonLoading>Marking...</ButtonLoading>
                      ) : (
                        <>
                          <Check className="h-4 w-4" strokeWidth={2} />
                          Mark as read
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveNotificationAction(`dismiss-${item.id}`);
                      dismiss.mutate(item.id, {
                        onSuccess: () => toast.success("Notification dismissed."),
                        onError: (err) =>
                          toast.error(
                            describeApiError(err, "Notification could not be dismissed."),
                          ),
                        onSettled: () => setActiveNotificationAction(null),
                      });
                    }}
                    disabled={dismiss.isPending}
                    aria-busy={activeNotificationAction === `dismiss-${item.id}`}
                    aria-label={`Dismiss "${item.title}"`}
                  >
                    {activeNotificationAction === `dismiss-${item.id}` ? (
                      <ButtonLoading>Dismissing...</ButtonLoading>
                    ) : (
                      <>
                        <X className="h-4 w-4" strokeWidth={2} />
                        Dismiss
                      </>
                    )}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}

function resolveNotificationAction(
  actionUrl: string | null | undefined,
  experience: Experience,
): string | null {
  if (!actionUrl) return null;

  const normalized = actionUrl.startsWith("/") ? actionUrl : `/${actionUrl}`;
  if (
    normalized === "/orders" ||
    normalized.startsWith("/orders/") ||
    normalized === "/payments" ||
    normalized.startsWith("/payments/")
  ) {
    return roleHref(experience, normalized);
  }

  if (
    experience === "exam" &&
    (normalized === "/tutor-requests" || normalized.startsWith("/tutor-requests/"))
  ) {
    return roleHref(experience, normalized.replace("/tutor-requests", "/tutoring"));
  }

  return null;
}
