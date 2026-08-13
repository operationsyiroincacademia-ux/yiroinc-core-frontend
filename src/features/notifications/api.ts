/**
 * Notifications — verified endpoints:
 *   GET   /notifications
 *   GET   /notifications/{id}
 *   GET   /notifications/unread-count
 *   PATCH /notifications/{id}/read
 *   PATCH /notifications/read-all
 *   PATCH /notifications/{id}/dismiss
 *
 * Notifications are user-specific; they are never filtered or shared by
 * frontend role.
 */

import { apiRequest } from "@/lib/api/client";
import { getAuthToken } from "@/lib/auth/token";
import {
  pickList,
  pickPagination,
  pickRecord,
  type ApiEnvelope,
  type Pagination,
} from "@/lib/api/envelope";

export type Notification = {
  id: string | number;
  title: string;
  message: string;
  type?: string | null;
  is_read?: string | number | boolean | null;
  read_at?: string | null;
  created_at?: string | null;
  related_type?: string | null;
  related_id?: string | number | null;
};

function token() {
  return getAuthToken();
}

export function isRead(notification: Notification): boolean {
  const flag = notification.is_read;
  if (flag === undefined || flag === null) return Boolean(notification.read_at);
  if (typeof flag === "boolean") return flag;
  return String(flag) === "1" || String(flag).toLowerCase() === "true";
}

export async function fetchNotifications(
  params: { page?: number; perPage?: number } = {},
) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.perPage ?? 20),
  });
  const res = await apiRequest<ApiEnvelope<unknown>>(
    `/notifications?${query.toString()}`,
    { token: token() },
  );
  return {
    notifications: pickList<Notification>(res.data, "notifications"),
    pagination: pickPagination(res.data) as Pagination | null,
  };
}

export async function fetchNotification(id: string | number) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/notifications/${id}`, {
    token: token(),
  });
  return pickRecord<Notification>(res.data, "notification");
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await apiRequest<ApiEnvelope<unknown>>("/notifications/unread-count", {
    token: token(),
  });
  const data = res.data as Record<string, unknown> | number | null;
  if (typeof data === "number") return data;
  const value =
    data && typeof data === "object"
      ? (data["unread_count"] ?? data["count"] ?? data["unread"])
      : null;
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function markNotificationRead(id: string | number) {
  await apiRequest(`/notifications/${id}/read`, { method: "PATCH", token: token() });
}

export async function markAllNotificationsRead() {
  await apiRequest("/notifications/read-all", { method: "PATCH", token: token() });
}

export async function dismissNotification(id: string | number) {
  await apiRequest(`/notifications/${id}/dismiss`, { method: "PATCH", token: token() });
}
