/**
 * Verified authentication endpoints on the YiroInc Academia API.
 *
 * Registration, login and session restoration all return the same shape:
 * { token?, user, profile, auth? }. Admin identity comes from auth/user
 * capability fields, never from profile.profile_type.
 */

import { apiRequest } from "@/lib/api/client";
import type { ProfileType } from "@/lib/roles";

export type ApiEnvelope<T> = { success: boolean; data: T };

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  is_admin?: string | number | boolean | null;
  roles?: string[];
  capabilities?: Record<string, string | number | boolean | null | undefined>;
  registered_at?: string;
};

export type AuthProfile = {
  id: number;
  profile_type: ProfileType;
  completed?: boolean;
};

export type AuthMeta = {
  is_admin?: string | number | boolean | null;
  capabilities?: Record<string, string | number | boolean | null | undefined>;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
  profile: AuthProfile;
  auth?: AuthMeta | null;
};

export type RegisterInput = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  profile_type: ProfileType;
};

export async function registerAccount(input: RegisterInput): Promise<AuthSession> {
  const res = await apiRequest<ApiEnvelope<AuthSession>>("/auth/register", {
    method: "POST",
    body: input,
  });
  return res.data;
}

export async function loginWithPassword(input: {
  email: string;
  password: string;
}): Promise<AuthSession> {
  const res = await apiRequest<ApiEnvelope<AuthSession>>("/auth/login", {
    method: "POST",
    body: input,
  });
  return res.data;
}

/** GET /auth/me — restores the session from a stored JWT. */
export async function fetchCurrentSession(
  token: string,
): Promise<{ user: AuthUser; profile: AuthProfile; auth?: AuthMeta | null }> {
  const res = await apiRequest<
    ApiEnvelope<{ user: AuthUser; profile: AuthProfile; auth?: AuthMeta | null }>
  >("/auth/me", { token });
  return res.data;
}

/**
 * POST /auth/logout — best effort. The caller must clear local auth state even
 * when this fails (for example when the JWT has already expired).
 */
export async function logoutSession(token: string): Promise<void> {
  await apiRequest<ApiEnvelope<unknown>>("/auth/logout", { method: "POST", token });
}
