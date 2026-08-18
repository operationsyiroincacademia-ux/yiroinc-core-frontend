/**
 * Resources — verified endpoints:
 *   GET /resources           authenticated user's visible resources
 *   GET /resources/{id}      single visible resource
 *   GET /resources/purchased authenticated user's entitled resources
 *
 * File resources are downloaded through the protected files endpoint.
 */

import { apiDownload, apiRequest } from "@/lib/api/client";
import { getAuthToken } from "@/lib/auth/token";
import { pickList, pickRecord, type ApiEnvelope } from "@/lib/api/envelope";
import type { ProfileType } from "@/lib/roles";

export type ResourceSourceType = "file" | "external";
export type ResourceAccessState = "accessible" | "purchased" | "buyable" | "restricted";

export type ResourceEntitlement = {
  id: number;
  order_id: number;
  payment_id: number;
  granted_at: string;
};

export type Resource = {
  id: string | number;
  title: string;
  description?: string | null;
  category?: string | null;
  source_type: ResourceSourceType;
  file_id?: string | number | null;
  file_name?: string | null;
  file_format?: string | null;
  mime_type?: string | null;
  file_size?: string | number | null;
  external_url?: string | null;
  price?: string | number | null;
  currency?: string | null;
  is_paid?: string | number | boolean | null;
  is_buyable?: string | number | boolean | null;
  is_purchased?: string | number | boolean | null;
  is_accessible?: string | number | boolean | null;
  access_state?: ResourceAccessState | string | null;
  entitlement?: ResourceEntitlement | null;
  profile_type?: ProfileType | null;
  exam_type?: string | null;
  is_public?: string | number | boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function token() {
  return getAuthToken();
}

export async function fetchResources() {
  const res = await apiRequest<ApiEnvelope<unknown>>("/resources", {
    token: token(),
  });
  return pickList<Resource>(res.data, "resources");
}

export async function fetchPurchasedResources() {
  const res = await apiRequest<ApiEnvelope<unknown>>("/resources/purchased", {
    token: token(),
  });
  return pickList<Resource>(res.data, "resources");
}

export async function fetchResource(id: string | number) {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/resources/${id}`, {
    token: token(),
  });
  return pickRecord<Resource>(res.data, "resource");
}

export async function downloadResourceFile(fileId: string | number) {
  return apiDownload(`/files/${fileId}/download`, token());
}
