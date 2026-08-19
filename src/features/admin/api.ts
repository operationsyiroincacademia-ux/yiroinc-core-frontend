import { apiDownload, apiRequest } from "@/lib/api/client";
import { getAuthToken } from "@/lib/auth/token";
import {
  pickList,
  pickPagination,
  pickRecord,
  type ApiEnvelope,
  type Pagination,
} from "@/lib/api/envelope";
import type { TimelineEvent } from "@/features/dashboard/api";
import type { Payment, PaymentActivity } from "@/features/payments/api";
import type { Order } from "@/features/orders/api";
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

export type AdminPaymentStatus = "all" | "awaiting_verification" | "verified" | "rejected";
export type AdminOrderStatus = "all" | "awaiting_payment" | "paid" | "completed";
export type AdminRequestKind = "tutor" | "consulting" | "procurement";
export type TutorAvailability = "available" | "unavailable";
export type TutorStatus = "active" | "inactive";

export type AdminTutor = {
  id: string | number;
  name: string;
  email?: string | null;
  whatsapp_number?: string | null;
  exam_expertise?: string | string[] | null;
  levels?: string | string[] | null;
  timezone?: string | null;
  availability?: TutorAvailability | string | null;
  bio?: string | null;
  status?: TutorStatus | string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AdminTutorsParams = {
  search?: string;
  status?: TutorStatus | "all";
  availability?: TutorAvailability | "all";
  examExpertise?: string;
  level?: string;
  page?: number;
  perPage?: number;
};

export type AdminTutorsResponse = {
  tutors: AdminTutor[];
  pagination: Pagination | null;
};

export type AdminTutorInput = {
  name: string;
  email?: string | null;
  whatsapp_number?: string | null;
  exam_expertise: string[];
  levels: string[];
  timezone?: string | null;
  availability: TutorAvailability;
  bio?: string | null;
  status: TutorStatus;
};

export type AdminPaymentsParams = {
  status?: AdminPaymentStatus;
  search?: string;
  page?: number;
  perPage?: number;
};

export type AdminPaymentsResponse = {
  payments: Payment[];
  pagination: Pagination | null;
};

export type AdminOrdersParams = {
  status?: AdminOrderStatus;
  search?: string;
  page?: number;
  perPage?: number;
};

export type AdminOrdersResponse = {
  orders: Order[];
  pagination: Pagination | null;
};

export type AdminOrderDetails = {
  order: Order;
  customer: Record<string, unknown> | null;
  payment: Payment | Record<string, unknown> | null;
  proof: AdminPaymentProof | null;
  item: Record<string, unknown> | null;
  timeline: unknown[];
};

export type AdminRequestsParams = {
  status?: string;
  search?: string;
  page?: number;
  perPage?: number;
};

export type AdminTutorRequestDetails = {
  request: TutorRequest;
  customer: Record<string, unknown> | null;
  tutor: AdminTutor | null;
  timeline: unknown[];
};

export type AdminConsultingRequestDetails = {
  request: ConsultingRequest;
  customer: Record<string, unknown> | null;
  timeline: unknown[];
};

export type AdminProcurementDetails = {
  procurement: Procurement;
  customer: Record<string, unknown> | null;
  order: Order | Record<string, unknown> | null;
  timeline: unknown[];
};

export type AdminPaymentCustomer = Record<string, unknown>;

export type AdminPaymentProof = {
  file_id?: string | number | null;
  file_name?: string | null;
  original_name?: string | null;
  mime_type?: string | null;
  file_size?: string | number | null;
  created_at?: string | null;
  download_url?: string | null;
};

export type AdminPaymentDetails = {
  payment: Payment;
  order: Order | Record<string, unknown> | null;
  customer: AdminPaymentCustomer | null;
  proof: AdminPaymentProof | null;
  activity: PaymentActivity[];
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

function nestedRecord<T>(value: unknown, key: string): T | null {
  const record = recordOf(value);
  const entry = record[key];
  return entry && typeof entry === "object" ? (entry as T) : null;
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

export async function fetchAdminPayments(
  params: AdminPaymentsParams = {},
): Promise<AdminPaymentsResponse> {
  const query = new URLSearchParams({
    status: params.status ?? "all",
    page: String(params.page ?? 1),
    per_page: String(params.perPage ?? 20),
  });
  const search = params.search?.trim();
  if (search) query.set("search", search);

  const res = await apiRequest<ApiEnvelope<unknown>>(`/admin/payments?${query.toString()}`, {
    token: token(),
  });

  return {
    payments: pickList<Payment>(res.data, "payments"),
    pagination: pickPagination(res.data),
  };
}

function queryString(params: {
  status?: string;
  search?: string;
  page?: number;
  perPage?: number;
}) {
  const query = new URLSearchParams({
    status: params.status ?? "all",
    page: String(params.page ?? 1),
    per_page: String(params.perPage ?? 20),
  });
  const search = params.search?.trim();
  if (search) query.set("search", search);
  return query.toString();
}

function tutorQueryString(params: AdminTutorsParams = {}) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.perPage ?? 20),
  });
  const search = params.search?.trim();
  if (search) query.set("search", search);
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.availability && params.availability !== "all") {
    query.set("availability", params.availability);
  }
  if (params.examExpertise) query.set("exam_expertise", params.examExpertise);
  if (params.level) query.set("level", params.level);
  return query.toString();
}

export async function fetchAdminOrders(
  params: AdminOrdersParams = {},
): Promise<AdminOrdersResponse> {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/admin/orders?${queryString(params)}`, {
    token: token(),
  });
  return {
    orders: pickList<Order>(res.data, "orders"),
    pagination: pickPagination(res.data),
  };
}

export async function fetchAdminOrder(id: string | number): Promise<AdminOrderDetails | null> {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/admin/orders/${id}`, { token: token() });
  const data = recordOf(res.data);
  const order = pickRecord<Order>(data, "order");
  if (!order) return null;
  return {
    order,
    customer: nestedRecord<Record<string, unknown>>(data, "customer"),
    payment: nestedRecord<Payment | Record<string, unknown>>(data, "payment"),
    proof: nestedRecord<AdminPaymentProof>(data, "proof"),
    item: nestedRecord<Record<string, unknown>>(data, "item"),
    timeline: arrayOf<unknown>(data.timeline),
  };
}

export async function updateOrderStatus(id: string | number, status: string) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/orders/${id}/status`, {
    method: "PATCH",
    token: token(),
    body: { status },
  });
  return pickRecord<Order>(res.data, "order");
}

export async function dispatchOrder(id: string | number) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/orders/${id}/dispatch`, {
    method: "PATCH",
    token: token(),
  });
  return pickRecord<Order>(res.data, "order");
}

export async function fulfilOrder(id: string | number) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/orders/${id}/fulfil`, {
    method: "PATCH",
    token: token(),
  });
  return pickRecord<Order>(res.data, "order");
}

export async function fetchAdminTutorRequests(params: AdminRequestsParams = {}) {
  const res = await apiRequest<ApiEnvelope<unknown>>(
    `/admin/tutor-requests?${queryString(params)}`,
    { token: token() },
  );
  return {
    requests: pickList<TutorRequest>(res.data, "requests"),
    pagination: pickPagination(res.data),
  };
}

export async function fetchAdminTutorRequest(
  id: string | number,
): Promise<AdminTutorRequestDetails | null> {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/admin/tutor-requests/${id}`, {
    token: token(),
  });
  const data = recordOf(res.data);
  const request = pickRecord<TutorRequest>(data, "request");
  if (!request) return null;
  return {
    request,
    customer: nestedRecord<Record<string, unknown>>(data, "customer"),
    tutor: nestedRecord<AdminTutor>(data, "tutor"),
    timeline: arrayOf<unknown>(data.timeline),
  };
}

export async function fetchAdminTutors(
  params: AdminTutorsParams = {},
): Promise<AdminTutorsResponse> {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/admin/tutors?${tutorQueryString(params)}`, {
    token: token(),
  });
  return {
    tutors: pickList<AdminTutor>(res.data, "tutors"),
    pagination: pickPagination(res.data),
  };
}

export async function fetchAdminTutor(id: string | number): Promise<AdminTutor | null> {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/admin/tutors/${id}`, { token: token() });
  return pickRecord<AdminTutor>(res.data, "tutor");
}

export async function createAdminTutor(input: AdminTutorInput) {
  const res = await apiRequest<ApiEnvelope<unknown>>("/admin/tutors", {
    method: "POST",
    token: token(),
    body: input,
  });
  return pickRecord<AdminTutor>(res.data, "tutor") ?? pickRecord<AdminTutor>(res.data, "data");
}

export async function updateAdminTutor(id: string | number, input: AdminTutorInput) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/admin/tutors/${id}`, {
    method: "PATCH",
    token: token(),
    body: input,
  });
  return pickRecord<AdminTutor>(res.data, "tutor");
}

export async function matchTutorRequest(id: string | number, tutorId: string | number) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/tutor-requests/${id}/match`, {
    method: "PATCH",
    token: token(),
    body: { tutor_id: tutorId },
  });
  return pickRecord<TutorRequest>(res.data, "request");
}

export async function startTutorRequest(id: string | number) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/tutor-requests/${id}/start`, {
    method: "PATCH",
    token: token(),
  });
  return pickRecord<TutorRequest>(res.data, "request");
}

export async function completeTutorRequest(id: string | number) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/tutor-requests/${id}/complete`, {
    method: "PATCH",
    token: token(),
  });
  return pickRecord<TutorRequest>(res.data, "request");
}

export async function fetchAdminConsultingRequests(params: AdminRequestsParams = {}) {
  const res = await apiRequest<ApiEnvelope<unknown>>(
    `/admin/consulting-requests?${queryString(params)}`,
    { token: token() },
  );
  return {
    requests: pickList<ConsultingRequest>(res.data, "requests"),
    pagination: pickPagination(res.data),
  };
}

export async function fetchAdminConsultingRequest(
  id: string | number,
): Promise<AdminConsultingRequestDetails | null> {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/admin/consulting-requests/${id}`, {
    token: token(),
  });
  const data = recordOf(res.data);
  const request = pickRecord<ConsultingRequest>(data, "request");
  if (!request) return null;
  return {
    request,
    customer: nestedRecord<Record<string, unknown>>(data, "customer"),
    timeline: arrayOf<unknown>(data.timeline),
  };
}

export async function startConsultingRequest(id: string | number) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/consulting-requests/${id}/start`, {
    method: "PATCH",
    token: token(),
  });
  return pickRecord<ConsultingRequest>(res.data, "request");
}

export async function completeConsultingRequest(id: string | number) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/consulting-requests/${id}/complete`, {
    method: "PATCH",
    token: token(),
  });
  return pickRecord<ConsultingRequest>(res.data, "request");
}

export async function fetchAdminProcurements(params: AdminRequestsParams = {}) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/admin/procurements?${queryString(params)}`, {
    token: token(),
  });
  return {
    procurements: pickList<Procurement>(res.data, "procurements"),
    pagination: pickPagination(res.data),
  };
}

export async function fetchAdminProcurement(
  id: string | number,
): Promise<AdminProcurementDetails | null> {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/admin/procurements/${id}`, {
    token: token(),
  });
  const data = recordOf(res.data);
  const procurement = pickRecord<Procurement>(data, "procurement");
  if (!procurement) return null;
  return {
    procurement,
    customer: nestedRecord<Record<string, unknown>>(data, "customer"),
    order: nestedRecord<Order | Record<string, unknown>>(data, "order"),
    timeline: arrayOf<unknown>(data.timeline),
  };
}

export async function markProcurementDelivered(id: string | number) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/procurements/${id}/delivered`, {
    method: "PATCH",
    token: token(),
  });
  return pickRecord<Procurement>(res.data, "procurement");
}

export async function fetchAdminPayment(id: string | number): Promise<AdminPaymentDetails | null> {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/admin/payments/${id}`, {
    token: token(),
  });
  const data = recordOf(res.data);
  const payment = pickRecord<Payment>(data, "payment");
  if (!payment) return null;

  return {
    payment,
    order: nestedRecord<Order | Record<string, unknown>>(data, "order"),
    customer: nestedRecord<AdminPaymentCustomer>(data, "customer"),
    proof: nestedRecord<AdminPaymentProof>(data, "proof"),
    activity: arrayOf<PaymentActivity>(data.activity),
  };
}

export async function downloadAdminProof(fileId: string | number) {
  return apiDownload(`/files/${fileId}/download`, token());
}

export async function verifyPayment(id: string | number) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/payments/${id}/verify`, {
    method: "PATCH",
    token: token(),
  });
  return pickRecord<Payment>(res.data, "payment");
}

export async function rejectPayment(id: string | number, rejectionReason: string) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/payments/${id}/reject`, {
    method: "PATCH",
    token: token(),
    body: { rejection_reason: rejectionReason },
  });
  return pickRecord<Payment>(res.data, "payment");
}
