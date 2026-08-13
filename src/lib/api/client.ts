/**
 * Single shared API client for the WordPress REST API.
 *
 * One base URL, one JWT Bearer scheme, one error shape. Feature folders build
 * their hooks on top of this — no feature may create its own fetch wrapper.
 */

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? ""
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** FormData for multipart uploads (e.g. proof of payment) */
  formData?: FormData;
  signal?: AbortSignal;
  /** Bearer token; supplied by the auth layer */
  token?: string | null;
};

async function parse(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, formData, signal, token } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    signal,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  const data = await parse(response);

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : null) ?? "Request failed";
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

/**
 * Protected file downloads: the request must be authenticated, so the file is
 * fetched as a blob rather than linked to directly.
 */
export async function apiDownload(
  path: string,
  token?: string | null,
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new ApiError("Download failed", response.status);
  }
  return response.blob();
}
