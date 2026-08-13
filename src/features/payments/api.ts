/**
 * Payments — verified endpoints:
 *   GET  /payments        list for the authenticated user
 *   GET  /payments/{id}   single payment record
 *   POST /payments        create record (commerce flow)
 *   POST /files/upload    proof of payment (commerce flow)
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

export type Payment = {
  id: string | number;
  payment_reference: string;
  order_id: string | number;
  order_number?: string | null;
  amount_paid: string | number;
  currency?: string | null;
  payment_status: string;
  has_pop?: string | number | null;
  created_at?: string | null;
  updated_at?: string | null;
  verified_at?: string | null;
  admin_note?: string | null;
};

function token() {
  return getAuthToken();
}

export async function fetchPayments(params: { page?: number; perPage?: number } = {}) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.perPage ?? 20),
  });
  const res = await apiRequest<ApiEnvelope<unknown>>(`/payments?${query.toString()}`, {
    token: token(),
  });
  return {
    payments: pickList<Payment>(res.data, "payments"),
    pagination: pickPagination(res.data) as Pagination | null,
  };
}

export async function fetchPayment(id: number | string) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/payments/${id}`, {
    token: token(),
  });
  return pickRecord<Payment>(res.data, "payment");
}
