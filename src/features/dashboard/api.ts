import { apiRequest } from "@/lib/api/client";
import { getAuthToken } from "@/lib/auth/token";
import type { ApiEnvelope } from "@/lib/api/envelope";
import type { Order } from "@/features/orders/api";
import type { Payment } from "@/features/payments/api";
import type { Resource } from "@/features/resources/api";
import type { Notification } from "@/features/notifications/api";
import type { TutorRequest } from "@/features/tutoring/api";
import type { ConsultingRequest, Procurement } from "@/features/corporate/api";

export type TimelineEvent = {
  id: string | number;
  user_id?: string | number;
  actor_id?: string | number;
  event: string;
  title: string;
  description?: string | null;
  related_type?: string | null;
  related_id?: string | number | null;
  metadata?: string | null;
  visibility?: string;
  created_at?: string | null;
};

export type GeneralDashboard = {
  profile: unknown;
  resources: Resource[];
  notifications: Notification[];
  timeline: TimelineEvent[];
  orders: Order[];
};

export type ExamDashboard = GeneralDashboard & {
  payments: Payment[];
  procurements: Procurement[];
  tutor_requests: TutorRequest[];
};

export type CorporateDashboard = GeneralDashboard & {
  consulting_requests: ConsultingRequest[];
  payments: Payment[];
  procurements: Procurement[];
};

function token() {
  return getAuthToken();
}

function arrayOf<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function recordOf(data: unknown): Record<string, unknown> {
  return data && typeof data === "object" ? (data as Record<string, unknown>) : {};
}

export async function fetchGeneralDashboard(): Promise<GeneralDashboard> {
  const res = await apiRequest<ApiEnvelope<unknown>>("/dashboard/general", {
    token: token(),
  });
  const data = recordOf(res.data);
  return {
    profile: data.profile ?? null,
    resources: arrayOf<Resource>(data.resources),
    notifications: arrayOf<Notification>(data.notifications),
    timeline: arrayOf<TimelineEvent>(data.timeline),
    orders: arrayOf<Order>(data.orders),
  };
}

export async function fetchExamDashboard(): Promise<ExamDashboard> {
  const res = await apiRequest<ApiEnvelope<unknown>>("/dashboard/exam", {
    token: token(),
  });
  const data = recordOf(res.data);
  return {
    profile: data.profile ?? null,
    resources: arrayOf<Resource>(data.resources),
    notifications: arrayOf<Notification>(data.notifications),
    timeline: arrayOf<TimelineEvent>(data.timeline),
    orders: arrayOf<Order>(data.orders),
    payments: arrayOf<Payment>(data.payments),
    procurements: arrayOf<Procurement>(data.procurements),
    tutor_requests: arrayOf<TutorRequest>(data.tutor_requests),
  };
}

export async function fetchCorporateDashboard(): Promise<CorporateDashboard> {
  const res = await apiRequest<ApiEnvelope<unknown>>("/dashboard/corporate", {
    token: token(),
  });
  const data = recordOf(res.data);
  return {
    profile: data.profile ?? null,
    resources: arrayOf<Resource>(data.resources),
    notifications: arrayOf<Notification>(data.notifications),
    timeline: arrayOf<TimelineEvent>(data.timeline),
    orders: arrayOf<Order>(data.orders),
    consulting_requests: arrayOf<ConsultingRequest>(data.consulting_requests),
    payments: arrayOf<Payment>(data.payments),
    procurements: arrayOf<Procurement>(data.procurements),
  };
}
