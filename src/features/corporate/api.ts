import { apiRequest } from "@/lib/api/client";
import { getAuthToken } from "@/lib/auth/token";
import {
  pickList,
  pickPagination,
  pickRecord,
  type ApiEnvelope,
  type Pagination,
} from "@/lib/api/envelope";

export type ConsultingRequestStatus =
  "pending" | "under_review" | "assigned" | "in_progress" | "completed" | "cancelled";

export type ConsultingRequest = {
  id: string | number;
  user_id?: string | number;
  service_type: string;
  organization_name?: string | null;
  contact_person: string;
  contact_email: string;
  contact_phone?: string | null;
  project_summary: string;
  budget?: string | number | null;
  preferred_date?: string | null;
  status: ConsultingRequestStatus | string;
  assigned_to?: string | number | null;
  assigned_by?: string | number | null;
  assigned_at?: string | null;
  started_by?: string | number | null;
  started_at?: string | null;
  admin_note?: string | null;
  completed_by?: string | number | null;
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ProcurementStatus =
  "pending" | "sourcing" | "ordered" | "shipped" | "delivered" | "cancelled";

export type Procurement = {
  id: string | number;
  order_id: string | number;
  user_id?: string | number;
  procurement_reference: string;
  supplier_name?: string | null;
  tracking_number?: string | null;
  courier?: string | null;
  status: ProcurementStatus | string;
  expected_delivery_date?: string | null;
  ordered_by?: string | number | null;
  ordered_at?: string | null;
  shipped_by?: string | number | null;
  shipped_at?: string | null;
  delivered_by?: string | number | null;
  delivered_at?: string | null;
  admin_note?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function token() {
  return getAuthToken();
}

export async function fetchConsultingRequests(
  params: { page?: number; perPage?: number; status?: string } = {},
) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.perPage ?? 20),
  });
  if (params.status) query.set("status", params.status);

  const res = await apiRequest<ApiEnvelope<unknown>>(`/consulting-requests?${query.toString()}`, {
    token: token(),
  });

  return {
    requests: pickList<ConsultingRequest>(res.data, "requests"),
    pagination: pickPagination(res.data) as Pagination | null,
  };
}

export async function fetchConsultingRequest(id: string | number) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/consulting-requests/${id}`, {
    token: token(),
  });
  return pickRecord<ConsultingRequest>(res.data, "request");
}

export async function fetchProcurements(
  params: { page?: number; perPage?: number; status?: string } = {},
) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.perPage ?? 20),
  });
  if (params.status) query.set("status", params.status);

  const res = await apiRequest<ApiEnvelope<unknown>>(`/procurements?${query.toString()}`, {
    token: token(),
  });

  return {
    procurements: pickList<Procurement>(res.data, "procurements"),
    pagination: pickPagination(res.data) as Pagination | null,
  };
}

export async function fetchProcurement(id: string | number) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/procurements/${id}`, {
    token: token(),
  });
  return pickRecord<Procurement>(res.data, "procurement");
}
