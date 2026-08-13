import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  dismissNotification,
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "./api";

export const NOTIFICATIONS_KEY = ["notifications"];
export const UNREAD_COUNT_KEY = ["notifications", "unread-count"];

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
  return useNotificationMutation<string | number>(markNotificationRead);
}

export function useDismissNotification() {
  return useNotificationMutation<string | number>(dismissNotification);
}

export function useMarkAllNotificationsRead() {
  return useNotificationMutation<void>(() => markAllNotificationsRead());
}
