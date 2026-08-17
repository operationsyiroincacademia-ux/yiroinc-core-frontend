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

export const NOTIFICATIONS_KEY = ["notifications"];
export const UNREAD_COUNT_KEY = ["notifications", "unread-count"];

type NotificationsData = {
  notifications: Notification[];
  pagination: Pagination | null;
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

function useNotificationMutation<T>(fn: (input: T) => Promise<void>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (_result, id) => {
      queryClient.setQueriesData<NotificationsData>({ queryKey: NOTIFICATIONS_KEY }, (current) => {
        if (!current) return current;
        return {
          ...current,
          notifications: current.notifications.map((notification) =>
            String(notification.id) === String(id)
              ? { ...notification, is_read: "1", read_at: notification.read_at ?? "" }
              : notification,
          ),
        };
      });
      queryClient.setQueryData<number>(UNREAD_COUNT_KEY, (current) =>
        typeof current === "number" ? Math.max(0, current - 1) : current,
      );
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

export function useDismissNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dismissNotification,
    onSuccess: (_result, id) => {
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
      if (removedUnread) {
        queryClient.setQueryData<number>(UNREAD_COUNT_KEY, (current) =>
          typeof current === "number" ? Math.max(0, current - removedUnread) : current,
        );
      }
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
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
          notifications: current.notifications.map((notification) => ({
            ...notification,
            is_read: "1",
            read_at: notification.read_at ?? "",
          })),
        };
      });
      queryClient.setQueryData(UNREAD_COUNT_KEY, 0);
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}
