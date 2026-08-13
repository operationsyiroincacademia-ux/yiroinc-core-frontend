import { ApiError } from "@/lib/api/client";

/** Human-readable message for any failed request, without inventing statuses. */
export function describeApiError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
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
