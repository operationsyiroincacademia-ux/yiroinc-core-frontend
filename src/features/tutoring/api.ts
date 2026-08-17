import { apiRequest } from "@/lib/api/client";
import { getAuthToken } from "@/lib/auth/token";
import {
  pickList,
  pickPagination,
  pickRecord,
  type ApiEnvelope,
  type Pagination,
} from "@/lib/api/envelope";

export type TutorRequestStatus = "pending" | "matched" | "in_progress" | "completed" | "cancelled";

export type TutorRequest = {
  id: string | number;
  user_id?: string | number;
  exam_type: string;
  exam_level?: string | null;
  preferred_timezone?: string | null;
  preferred_language?: string | null;
  additional_notes?: string | null;
  status: TutorRequestStatus | string;
  assigned_tutor_id?: string | number | null;
  matched_by?: string | number | null;
  matched_at?: string | null;
  session_started_by?: string | number | null;
  session_started_at?: string | null;
  completed_by?: string | number | null;
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CreateTutorRequestInput = {
  exam_type: string;
  exam_level?: string | null;
  preferred_timezone?: string | null;
  preferred_language?: string | null;
  additional_notes?: string | null;
};

function token() {
  return getAuthToken();
}

export async function fetchTutorRequests(
  params: { page?: number; perPage?: number; status?: string } = {},
) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.perPage ?? 20),
  });
  if (params.status) query.set("status", params.status);

  const res = await apiRequest<ApiEnvelope<unknown>>(`/tutor-requests?${query.toString()}`, {
    token: token(),
  });

  return {
    requests: pickList<TutorRequest>(res.data, "requests"),
    pagination: pickPagination(res.data) as Pagination | null,
  };
}

export async function fetchTutorRequest(id: string | number) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/tutor-requests/${id}`, {
    token: token(),
  });
  return pickRecord<TutorRequest>(res.data, "request");
}

export async function createTutorRequest(input: CreateTutorRequestInput) {
  const res = await apiRequest<ApiEnvelope<{ request_id: string | number }>>("/tutor-requests", {
    method: "POST",
    token: token(),
    body: input,
  });
  return res.data;
}
