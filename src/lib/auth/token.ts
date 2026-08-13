/**
 * JWT access token storage for the WordPress REST API.
 *
 * The auth/login screen is not built yet; until then the token is read from
 * browser storage so the authenticated API client can attach it as
 * `Authorization: Bearer <token>`. When the auth layer lands it only needs to
 * write the token through `setAuthToken`.
 */

const TOKEN_KEY = "yac_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      window.localStorage.getItem(TOKEN_KEY) ??
      window.sessionStorage.getItem(TOKEN_KEY)
    );
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}
