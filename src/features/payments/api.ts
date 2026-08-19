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
  user_id?: string | number;
  payment_method?: string | null;
  amount_paid: string | number;
  currency?: string | null;
  payment_status: string;
  has_pop?: string | number | null;
  user_note?: string | null;
  submitted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  verified_by?: string | number | null;
  verified_at?: string | null;
  rejected_by?: string | number | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  admin_note?: string | null;
};

export type PaymentActivity = {
  id: string | number;
  event: string;
  title?: string | null;
  description?: string | null;
  related_type?: string | null;
  related_id?: string | number | null;
  metadata?: string | Record<string, unknown> | null;
  created_at?: string | null;
};

export type PaymentDetails = {
  payment: Payment;
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

export async function fetchPayment(id: number | string): Promise<PaymentDetails | null> {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/payments/${id}`, {
    token: token(),
  });
  const data = recordOf(res.data);
  const payment = pickRecord<Payment>(data, "payment");
  if (!payment) return null;
  return {
    payment,
    activity: arrayOf<PaymentActivity>(data.activity),
  };
}
