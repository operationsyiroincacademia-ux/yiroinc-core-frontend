import { ApiError } from "@/lib/api/client";

const CLOSED_ACCOUNT_CODES = new Set(["yac_account_closed", "yac_google_account_closed"]);
const CLOSED_ACCOUNT_MESSAGE = "This account has been closed and can no longer be accessed.";

function apiErrorCode(error: ApiError): string | null {
  const data = error.data;
  if (!data || typeof data !== "object" || !("code" in data)) return null;
  const code = (data as { code: unknown }).code;
  return typeof code === "string" ? code : null;
}

export function isClosedAccountError(error: unknown): boolean {
  return error instanceof ApiError && CLOSED_ACCOUNT_CODES.has(apiErrorCode(error) ?? "");
}

/** Human-readable message for any failed request, without inventing statuses. */
export function describeApiError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (isClosedAccountError(error)) return CLOSED_ACCOUNT_MESSAGE;
    if (error.status === 401 || error.status === 403) {
      return "Your session has expired or you are not signed in. Please sign in again and retry.";
    }
    if (error.status === 404) return "The requested record could not be found.";
    return error.message || fallback;
  }
  if (error instanceof TypeError) {
    return "Network error — check your connection and try again.";
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
