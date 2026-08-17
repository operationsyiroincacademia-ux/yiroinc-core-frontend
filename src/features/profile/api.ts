/**
 * Profile — verified endpoints:
 *   GET            /profiles   authenticated user's profile
 *   POST/PUT/PATCH /profiles   update editable profile fields
 *
 * Name and email are account identity fields from /auth/me, not profile fields.
 */

import { apiRequest } from "@/lib/api/client";
import { getAuthToken } from "@/lib/auth/token";
import { pickRecord, type ApiEnvelope } from "@/lib/api/envelope";
import type { ProfileType } from "@/lib/roles";

export type Profile = {
  id: string | number;
  user_id: string | number;
  profile_type: ProfileType;
  phone?: string | null;
  organization_name?: string | null;
  exam_type?: string | null;
  exam_level?: string | null;
  institution?: string | null;
  area_of_interest?: string | null;
  country?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type UpdateProfileInput = {
  phone?: string | null;
  organization_name?: string | null;
  exam_type?: string | null;
  exam_level?: string | null;
  institution?: string | null;
  area_of_interest?: string | null;
  country?: string | null;
};

function token() {
  return getAuthToken();
}

export async function fetchProfile() {
  const res = await apiRequest<ApiEnvelope<unknown>>("/profiles", {
    token: token(),
  });
  return pickRecord<Profile>(res.data, "profile");
}

export async function updateProfile(input: UpdateProfileInput) {
  const res = await apiRequest<ApiEnvelope<{ message?: string }>>("/profiles", {
    method: "PATCH",
    token: token(),
    body: input,
  });
  return res.data;
}
