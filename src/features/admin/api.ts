import { apiRequest } from "@/lib/api/client";
import { getAuthToken } from "@/lib/auth/token";
import type { ApiEnvelope } from "@/lib/api/envelope";
import type { TimelineEvent } from "@/features/dashboard/api";
import type { Payment } from "@/features/payments/api";
import type { TutorRequest } from "@/features/tutoring/api";
import type { ConsultingRequest, Procurement } from "@/features/corporate/api";

export type AdminDashboardSummary = {
  users: string | number;
  resources: {
    total: string | number;
    free: string | number;
    paid: string | number;
  };
  orders: {
    awaiting_payment: string | number;
    under_review: string | number;
    processing: string | number;
    completed: string | number;
    cancelled: string | number;
  };
  payments: {
    awaiting_verification: string | number;
    verified: string | number;
    rejected: string | number;
  };
  pending_tutor_requests: string | number;
  pending_consulting_requests: string | number;
  pending_procurements: string | number;
};

export type AdminDashboard = {
  summary: AdminDashboardSummary;
  recent_activity: TimelineEvent[];
  pending_payments: Payment[];
  pending_tutor_requests: TutorRequest[];
  pending_consulting_requests: ConsultingRequest[];
  pending_procurements: Procurement[];
};

function token() {
  return getAuthToken();
}

function arrayOf<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function recordOf(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function countRecord(value: unknown): Record<string, string | number> {
  const record = recordOf(value);
  return Object.fromEntries(
    Object.entries(record).map(([key, entry]) => [
      key,
      typeof entry === "string" || typeof entry === "number" ? entry : 0,
    ]),
  );
}

function summaryOf(value: unknown): AdminDashboardSummary {
  const summary = recordOf(value);
  const resources = countRecord(summary.resources);
  const orders = countRecord(summary.orders);
  const payments = countRecord(summary.payments);

  return {
    users:
      typeof summary.users === "string" || typeof summary.users === "number" ? summary.users : 0,
    resources: {
      total: resources.total ?? 0,
      free: resources.free ?? 0,
      paid: resources.paid ?? 0,
    },
    orders: {
      awaiting_payment: orders.awaiting_payment ?? 0,
      under_review: orders.under_review ?? 0,
      processing: orders.processing ?? 0,
      completed: orders.completed ?? 0,
      cancelled: orders.cancelled ?? 0,
    },
    payments: {
      awaiting_verification: payments.awaiting_verification ?? 0,
      verified: payments.verified ?? 0,
      rejected: payments.rejected ?? 0,
    },
    pending_tutor_requests:
      typeof summary.pending_tutor_requests === "string" ||
      typeof summary.pending_tutor_requests === "number"
        ? summary.pending_tutor_requests
        : 0,
    pending_consulting_requests:
      typeof summary.pending_consulting_requests === "string" ||
      typeof summary.pending_consulting_requests === "number"
        ? summary.pending_consulting_requests
        : 0,
    pending_procurements:
      typeof summary.pending_procurements === "string" ||
      typeof summary.pending_procurements === "number"
        ? summary.pending_procurements
        : 0,
  };
}

export async function fetchAdminDashboard(): Promise<AdminDashboard> {
  const res = await apiRequest<ApiEnvelope<unknown>>("/admin/dashboard", {
    token: token(),
  });
  const data = recordOf(res.data);

  return {
    summary: summaryOf(data.summary),
    recent_activity: arrayOf<TimelineEvent>(data.recent_activity),
    pending_payments: arrayOf<Payment>(data.pending_payments),
    pending_tutor_requests: arrayOf<TutorRequest>(data.pending_tutor_requests),
    pending_consulting_requests: arrayOf<ConsultingRequest>(data.pending_consulting_requests),
    pending_procurements: arrayOf<Procurement>(data.pending_procurements),
  };
}
