import { useMemo, useState } from "react";
import { ArrowRight, Bell } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { ContentLoading } from "@/components/shared/LoadingState";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDateTime, humaniseStatus } from "@/features/commerce/format";
import { isRead, type Notification } from "@/features/notifications/api";
import {
  useNotifications,
  useUnreadCount,
} from "@/features/notifications/hooks";
import {
  notificationActionHref,
  notificationsPageHref,
} from "@/features/notifications/navigation";
import { describeApiError } from "@/lib/api/errors";
import type { Experience } from "@/lib/roles";
import { cn } from "@/lib/utils";

const RECENT_NOTIFICATION_COUNT = 5;

export function NotificationPopover({ experience }: { experience: Experience }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const unreadCount = useUnreadCount();
  const notifications = useNotifications(1, RECENT_NOTIFICATION_COUNT, open);

  const unreadNotifications = unreadCount.data ?? 0;
  const items = useMemo(() => notifications.data?.notifications ?? [], [notifications.data]);

  function navigateAndClose(href: string) {
    setOpen(false);
    navigate({ to: href });
  }

  function handleNotificationClick(notification: Notification) {
    const href = notificationActionHref(notification, experience);
    if (href) {
      navigateAndClose(href);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            unreadNotifications > 0
              ? `Notifications, ${unreadNotifications} unread`
              : "Notifications"
          }
          className="relative inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Bell className="h-5 w-5" strokeWidth={1.9} />
          {unreadNotifications > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        collisionPadding={16}
        className="w-[calc(100vw-2rem)] max-w-[24rem] overflow-hidden rounded-none border-border bg-card p-0 text-card-foreground shadow-[0_18px_48px_rgba(15,23,42,0.16)] sm:w-96"
      >
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-foreground">Notifications</h2>
            {unreadNotifications > 0 && (
              <span className="shrink-0 border border-accent/25 bg-background px-2 py-0.5 text-[11px] font-semibold text-accent">
                {unreadNotifications} unread
              </span>
            )}
          </div>
        </div>

        <div className="max-h-[min(26rem,calc(100vh-12rem))] overflow-y-auto">
          {notifications.isLoading ? (
            <ContentLoading message="Loading notifications..." className="px-4 py-10" />
          ) : notifications.isError ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-semibold text-foreground">
                Notifications could not be loaded
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {describeApiError(notifications.error, "Please try again in a moment.")}
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <span className="mx-auto grid h-10 w-10 place-items-center bg-primary-soft text-primary">
                <Bell className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground">No notifications</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Updates about your activity will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <NotificationPreviewItem
                  key={String(item.id)}
                  item={item}
                  actionHref={notificationActionHref(item, experience)}
                  onClick={() => handleNotificationClick(item)}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border bg-background px-4 py-3">
          <button
            type="button"
            onClick={() => navigateAndClose(notificationsPageHref(experience))}
            className="inline-flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span>See all notifications</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationPreviewItem({
  item,
  actionHref,
  onClick,
}: {
  item: Notification;
  actionHref: string | null;
  onClick: () => void;
}) {
  const read = isRead(item);
  const category = item.type ? humaniseStatus(item.type) : null;
  const className = cn(
    "flex w-full gap-3 px-4 py-3 text-left",
    actionHref &&
      "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
    read
      ? actionHref
        ? "bg-card hover:bg-muted/60"
        : "bg-card"
      : actionHref
        ? "bg-primary-soft/35 hover:bg-primary-soft/55"
        : "bg-primary-soft/35",
  );

  const content = (
    <>
      <span
        aria-hidden
        className={cn(
          "mt-2 h-2 w-2 shrink-0 rounded-full",
          read ? "border border-border bg-card" : "bg-accent ring-2 ring-background",
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-start justify-between gap-3">
          <span
            className={cn(
              "min-w-0 truncate text-sm leading-5 text-foreground",
              read ? "font-medium" : "font-bold",
            )}
          >
            {item.title}
          </span>
          {category && (
            <span className="shrink-0 border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
              {category}
            </span>
          )}
        </span>
        <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {item.message}
        </span>
        <span className="mt-2 block text-[11px] font-medium text-muted-foreground">
          {formatDateTime(item.created_at)}
        </span>
      </span>
    </>
  );

  return (
    <li>
      {actionHref ? (
        <button
          type="button"
          onClick={onClick}
          className={className}
          aria-label={`Open "${item.title}" notification`}
        >
          {content}
        </button>
      ) : (
        <div className={className}>{content}</div>
      )}
    </li>
  );
}
