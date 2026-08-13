/**
 * Orders — verified endpoints: GET /orders, GET /orders/{id}.
 * Numeric database columns arrive as strings and are converted for display.
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

export type Order = {
  id: string;
  order_number: string;
  user_id?: string;
  woo_product_id?: string;
  woo_variation_id?: string | null;
  product_name_snapshot: string;
  sku_snapshot?: string | null;
  quantity: string | number;
  unit_price: string | number;
  total_price: string | number;
  currency: string;
  order_status: string;
  payment_status: string;
  fulfillment_status: string;
  customer_note?: string | null;
  admin_note?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  payment_id?: string | number | null;
  has_pop?: string | number | null;
  related_payment_status?: string | null;
};

function token() {
  return getAuthToken();
}

export async function fetchOrders(params: { page?: number; perPage?: number } = {}) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.perPage ?? 20),
  });
  const res = await apiRequest<ApiEnvelope<unknown>>(`/orders?${query.toString()}`, {
    token: token(),
  });
  return {
    orders: pickList<Order>(res.data, "orders"),
    pagination: pickPagination(res.data) as Pagination | null,
  };
}

export async function fetchOrder(id: number | string) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/orders/${id}`, { token: token() });
  return pickRecord<Order>(res.data, "order");
}
