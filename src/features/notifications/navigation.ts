import type { Experience } from "@/lib/roles";
import { roleHref } from "@/lib/roles/experience-context";

import type { Notification } from "./api";

export function notificationsPageHref(experience: Experience): string {
  return roleHref(experience, "/notifications");
}

export function notificationActionHref(
  notification: Notification,
  experience: Experience,
): string | null {
  if (experience === "admin") {
    return adminNotificationActionHref(notification);
  }

  return userNotificationActionHref(notification.action_url, experience);
}

export function userNotificationActionHref(
  actionUrl: string | null | undefined,
  experience: Experience,
): string | null {
  if (!actionUrl) return null;

  const normalized = actionUrl.startsWith("/") ? actionUrl : `/${actionUrl}`;
  if (
    normalized === "/orders" ||
    normalized.startsWith("/orders/") ||
    normalized === "/payments" ||
    normalized.startsWith("/payments/") ||
    normalized === "/support" ||
    normalized.startsWith("/support/")
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

export function adminNotificationActionHref(notification: Notification): string | null {
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
  if (["support_ticket", "support_tickets", "support"].includes(normalized)) {
    return "support_ticket";
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
    /^\/(admin\/)?(payments|support|tutor-requests|consulting-requests|procurements)\/([^/]+)$/,
  );
  if (!match) return null;
  return {
    type:
      match[2] === "payments"
        ? "payment"
        : match[2] === "support"
          ? "support_ticket"
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
  if (type === "support_ticket") return `/admin/support/${encodedId}`;
  if (type === "tutor_request") return `/admin/requests/tutor/${encodedId}`;
  if (type === "consulting_request") return `/admin/requests/consulting/${encodedId}`;
  if (type === "procurement") return `/admin/requests/procurement/${encodedId}`;
  return null;
}
