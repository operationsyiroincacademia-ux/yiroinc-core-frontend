import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  dismissNotification,
  fetchNotifications,
  fetchUnreadCount,
  isRead,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
} from "./api";
import type { Pagination } from "@/lib/api/envelope";
import { DASHBOARD_KEY } from "@/features/dashboard/hooks";

export const NOTIFICATIONS_KEY = ["notifications"];
export const UNREAD_COUNT_KEY = ["notifications", "unread-count"];

type NotificationsData = {
  notifications: Notification[];
  pagination: Pagination | null;
};

type DashboardNotificationsData = {
  notifications?: Notification[];
};

export function useNotifications(page = 1, perPage = 20) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, page, perPage],
    queryFn: () => fetchNotifications({ page, perPage }),
    retry: false,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: fetchUnreadCount,
    retry: false,
  });
}

function refreshInactiveNotificationCaches(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY, refetchType: "inactive" });
  void queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY, refetchType: "inactive" });
  void queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY, refetchType: "inactive" });
}

function setNotificationRead(notification: Notification): Notification {
  return { ...notification, is_read: "1", read_at: notification.read_at ?? "" };
}

function markReadInCachedLists(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string | number,
) {
  let changedUnread = 0;
  queryClient.setQueriesData<NotificationsData>({ queryKey: NOTIFICATIONS_KEY }, (current) => {
    if (!current) return current;
    return {
      ...current,
      notifications: current.notifications.map((notification) => {
        if (String(notification.id) !== String(id)) return notification;
        if (!isRead(notification)) changedUnread = 1;
        return setNotificationRead(notification);
      }),
    };
  });
  queryClient.setQueriesData<DashboardNotificationsData>({ queryKey: DASHBOARD_KEY }, (current) => {
    if (!current?.notifications) return current;
    return {
      ...current,
      notifications: current.notifications.map((notification) =>
        String(notification.id) === String(id) ? setNotificationRead(notification) : notification,
      ),
    };
  });
  return changedUnread;
}

function dismissInCachedLists(queryClient: ReturnType<typeof useQueryClient>, id: string | number) {
  let removedUnread = 0;
  queryClient.setQueriesData<NotificationsData>({ queryKey: NOTIFICATIONS_KEY }, (current) => {
    if (!current) return current;
    const removed = current.notifications.find(
      (notification) => String(notification.id) === String(id),
    );
    if (removed && !isRead(removed)) removedUnread = 1;
    return {
      ...current,
      notifications: current.notifications.filter(
        (notification) => String(notification.id) !== String(id),
      ),
    };
  });
  queryClient.setQueriesData<DashboardNotificationsData>({ queryKey: DASHBOARD_KEY }, (current) => {
    if (!current?.notifications) return current;
    const removed = current.notifications.find(
      (notification) => String(notification.id) === String(id),
    );
    if (removed && !isRead(removed)) removedUnread = 1;
    return {
      ...current,
      notifications: current.notifications.filter(
        (notification) => String(notification.id) !== String(id),
      ),
    };
  });
  return removedUnread;
}

function decrementUnreadCount(queryClient: ReturnType<typeof useQueryClient>, amount: number) {
  if (amount <= 0) return;
  queryClient.setQueryData<number>(UNREAD_COUNT_KEY, (current) =>
    typeof current === "number" ? Math.max(0, current - amount) : current,
  );
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (_result, id) => {
      decrementUnreadCount(queryClient, markReadInCachedLists(queryClient, id));
      refreshInactiveNotificationCaches(queryClient);
    },
  });
}

export function useDismissNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dismissNotification,
    onSuccess: (_result, id) => {
      decrementUnreadCount(queryClient, dismissInCachedLists(queryClient, id));
      refreshInactiveNotificationCaches(queryClient);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.setQueriesData<NotificationsData>({ queryKey: NOTIFICATIONS_KEY }, (current) => {
        if (!current) return current;
        return {
          ...current,
          notifications: current.notifications.map(setNotificationRead),
        };
      });
      queryClient.setQueriesData<DashboardNotificationsData>(
        { queryKey: DASHBOARD_KEY },
        (current) => {
          if (!current?.notifications) return current;
          return {
            ...current,
            notifications: current.notifications.map(setNotificationRead),
          };
        },
      );
      queryClient.setQueryData(UNREAD_COUNT_KEY, 0);
      refreshInactiveNotificationCaches(queryClient);
    },
  });
}
