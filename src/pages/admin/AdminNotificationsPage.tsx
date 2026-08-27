import { useMemo, useState } from "react";
import { Bell, Check, CheckCheck, ExternalLink, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/button-loading";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, humaniseStatus } from "@/features/commerce/format";
import { isRead, type Notification } from "@/features/notifications/api";
import {
  useDismissNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from "@/features/notifications/hooks";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";

const PER_PAGE = 20;

export function AdminNotificationsPage() {
  const [page, setPage] = useState(1);
  const [activeNotificationAction, setActiveNotificationAction] = useState<string | null>(null);
  const navigate = useNavigate();
  const notifications = useNotifications(page, PER_PAGE);
  const unreadCount = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const dismiss = useDismissNotification();

  const items = useMemo(() => notifications.data?.notifications ?? [], [notifications.data]);
  const pagination = notifications.data?.pagination;
  const totalPages = Math.max(1, pagination?.total_pages ?? 1);
  const totalUnread = unreadCount.data ?? items.filter((item) => !isRead(item)).length;

  return (
    <AdminLayout>
      <PageHeader
        title="Notifications"
        description="View updates and activity that need your attention."
        actions={
          <Button
            variant="outline"
            size="sm"
            aria-busy={markAllRead.isPending}
            onClick={() =>
              markAllRead.mutate(undefined, {
                onSuccess: () => toast.success("All notifications marked as read."),
                onError: (error) =>
                  toast.error(describeApiError(error, "Notifications could not be updated.")),
              })
            }
            disabled={totalUnread === 0 || markAllRead.isPending}
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
        }
      />

      <section className="min-w-0 border border-border bg-card">
        {notifications.isLoading ? (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground">
            Loading notifications...
          </p>
        ) : notifications.isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">
              Notifications could not be loaded
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {describeApiError(notifications.error, "Please try again in a moment.")}
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Bell className="mx-auto h-6 w-6 text-muted-foreground" strokeWidth={1.7} />
            <p className="mt-3 text-sm font-semibold text-foreground">No notifications</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
              Admin updates for payments and requests will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <NotificationRow
                key={String(item.id)}
                item={item}
                activeNotificationAction={activeNotificationAction}
                markReadPending={markRead.isPending}
                dismissPending={dismiss.isPending}
                onOpen={(href) => navigate({ to: href })}
                onMarkRead={() => {
                  setActiveNotificationAction(`read-${item.id}`);
                  markRead.mutate(item.id, {
                    onError: (error) =>
                      toast.error(
                        describeApiError(error, "Notification could not be marked as read."),
                      ),
                    onSettled: () => setActiveNotificationAction(null),
                  });
                }}
                onDismiss={() => {
                  setActiveNotificationAction(`dismiss-${item.id}`);
                  dismiss.mutate(item.id, {
                    onError: (error) =>
                      toast.error(describeApiError(error, "Notification could not be dismissed.")),
                    onSettled: () => setActiveNotificationAction(null),
                  });
                }}
              />
            ))}
          </ul>
        )}
      </section>

      {!notifications.isLoading && !notifications.isError && items.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Page {pagination?.page ?? page} of {totalPages}
            {pagination ? ` · ${pagination.total} total` : ""}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function NotificationRow({
  item,
  activeNotificationAction,
  markReadPending,
  dismissPending,
  onOpen,
  onMarkRead,
  onDismiss,
}: {
  item: Notification;
  activeNotificationAction: string | null;
  markReadPending: boolean;
  dismissPending: boolean;
  onOpen: (href: string) => void;
  onMarkRead: () => void;
  onDismiss: () => void;
}) {
  const read = isRead(item);
  const category = item.type ? humaniseStatus(item.type) : null;
  const actionHref = resolveAdminNotificationAction(item);

  return (
    <li className={read ? "p-5" : "bg-primary-soft/35 p-5"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span
            aria-hidden
            className={
              read
                ? "mt-2 h-2 w-2 shrink-0 rounded-full border border-border bg-card"
                : "mt-2 h-2 w-2 shrink-0 rounded-full bg-accent ring-2 ring-background"
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
                <span className="border border-accent/30 bg-background px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-accent">
                  Unread
                </span>
              )}
            </div>
            <p className="mt-1.5 break-words text-sm leading-relaxed text-muted-foreground">
              {item.message}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(item.created_at)}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end sm:pl-4">
          {actionHref && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpen(actionHref)}
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
              onClick={onMarkRead}
              disabled={markReadPending}
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
            onClick={onDismiss}
            disabled={dismissPending}
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
      </div>
    </li>
  );
}

function resolveAdminNotificationAction(notification: Notification): string | null {
  const relatedType = normalizeRelatedType(notification.related_type);
  const relatedId = notification.related_id != null ? String(notification.related_id) : "";

  if (relatedType && relatedId) {
    return adminHrefForRelated(relatedType, relatedId);
  }

  const action = parseActionUrl(notification.action_url);
  if (!action) return null;
  return adminHrefForRelated(action.type, action.id);
}

function normalizeRelatedType(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.toLowerCase().replace(/[-\s]+/g, "_");
  if (["payment", "payments", "proof_of_payment", "pop"].includes(normalized)) return "payment";
  if (["tutor_request", "tutor_requests", "tutoring"].includes(normalized)) {
    return "tutor_request";
  }
  if (["consulting_request", "consulting_requests", "consulting"].includes(normalized)) {
    return "consulting_request";
  }
  if (["procurement", "procurements", "procurement_request"].includes(normalized)) {
    return "procurement";
  }
  return null;
}

function parseActionUrl(actionUrl: string | null | undefined): { type: string; id: string } | null {
  if (!actionUrl) return null;
  const path = actionUrl
    .replace(/^https?:\/\/[^/]+/i, "")
    .split("?")[0]
    ?.replace(/\/$/, "");
  if (!path) return null;

  const match = path.match(
    /^\/(admin\/)?(payments|tutor-requests|consulting-requests|procurements)\/([^/]+)$/,
  );
  if (!match) return null;
  return {
    type:
      match[2] === "payments"
        ? "payment"
        : match[2] === "tutor-requests"
          ? "tutor_request"
          : match[2] === "consulting-requests"
            ? "consulting_request"
            : "procurement",
    id: decodeURIComponent(match[3]),
  };
}

function adminHrefForRelated(type: string, id: string): string | null {
  if (!id) return null;
  const encodedId = encodeURIComponent(id);
  if (type === "payment") return `/admin/payments/${encodedId}`;
  if (type === "tutor_request") return `/admin/requests/tutor/${encodedId}`;
  if (type === "consulting_request") return `/admin/requests/consulting/${encodedId}`;
  if (type === "procurement") return `/admin/requests/procurement/${encodedId}`;
  return null;
}
