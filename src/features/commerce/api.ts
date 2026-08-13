/**
 * Verified commerce endpoints on the YiroInc Academia API.
 *
 * Base URL comes from VITE_API_BASE_URL. Every call goes through the shared
 * authenticated API client, which attaches the JWT Bearer token.
 */

import { ApiError, apiRequest, API_BASE_URL } from "@/lib/api/client";
import { getAuthToken } from "@/lib/auth/token";

export type ApiEnvelope<T> = { success: boolean; data: T };

export type Product = {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  type: string;
  short_description: string;
  description: string;
  price: number;
  regular_price: number | null;
  sale_price: number | null;
  currency: string;
  image: string | null;
};

export type Pagination = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

export type BankAccount = {
  account_name: string;
  account_number: string;
  bank_name: string;
  currency: string;
  payment_instruction: string;
};

export type CreatedOrder = {
  order_id: number;
  order_reference: string;
  total_amount: number;
  currency: string;
};

/** GET /orders/{id} — numeric columns arrive as strings from the database. */
export type Order = {
  id: string;
  order_number: string;
  user_id: string;
  woo_product_id: string;
  woo_variation_id: string | null;
  product_name_snapshot: string;
  sku_snapshot: string | null;
  quantity: string;
  unit_price: string;
  total_price: string;
  currency: string;
  order_status: string;
  payment_status: string;
  fulfillment_status: string;
  payment_id: string | number | null;
  has_pop: string | number;
  related_payment_status: string | null;
  customer_note: string | null;
  admin_note: string | null;
};


export type CreatedPayment = {
  payment_id: number;
  order_id: number;
  payment_reference: string;
  amount_paid: number;
  currency: string;
};

export type UploadedProof = {
  file_id: number;
  related_type: string;
  related_id: number;
  file_type: string;
  payment_status: string;
  order_status: string;
  message: string;
};

function token() {
  return getAuthToken();
}

export async function fetchProducts(params: { page?: number; perPage?: number } = {}) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.perPage ?? 20),
  });
  const res = await apiRequest<ApiEnvelope<{ products: Product[]; pagination: Pagination }>>(
    `/products?${query.toString()}`,
    { token: token() },
  );
  return res.data;
}

export async function fetchProduct(id: number | string) {
  const res = await apiRequest<ApiEnvelope<{ product: Product }>>(`/products/${id}`, {
    token: token(),
  });
  return res.data.product;
}

export async function fetchBankAccount() {
  const res = await apiRequest<ApiEnvelope<{ bank_account: BankAccount }>>(
    "/settings/bank-account",
    { token: token() },
  );
  return res.data.bank_account;
}

export async function createOrder(input: { productId: number; quantity: number }) {
  const res = await apiRequest<ApiEnvelope<CreatedOrder>>("/orders", {
    method: "POST",
    token: token(),
    body: { woo_product_id: input.productId, quantity: input.quantity },
  });
  return res.data;
}

export async function createPayment(orderId: number) {
  const res = await apiRequest<ApiEnvelope<CreatedPayment>>("/payments", {
    method: "POST",
    token: token(),
    body: { order_id: orderId },
  });
  return res.data;
}

export async function uploadProofOfPayment(input: { paymentId: number; file: File }) {
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("related_type", "payment");
  formData.append("related_id", String(input.paymentId));
  formData.append("file_type", "proof_of_payment");

  const res = await apiRequest<ApiEnvelope<UploadedProof>>("/files/upload", {
    method: "POST",
    token: token(),
    formData,
  });
  return res.data;
}

export { describeApiError } from "@/lib/api/errors";

export const IS_API_CONFIGURED = API_BASE_URL.length > 0;

export async function fetchOrder(id: number | string) {
  const res = await apiRequest<ApiEnvelope<{ order: Order }>>(`/orders/${id}`, {
    token: token(),
  });
  return res.data.order;
}
