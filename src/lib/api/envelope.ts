/**
 * Response helpers for the YiroInc Academia API.
 *
 * The verified single-record endpoints return `{ success, data: { <key>: ... } }`.
 * List endpoints are read through the same envelope; the collection is located
 * by its documented key, falling back to a bare array so a differently keyed
 * (but still real) API response is surfaced rather than dropped. No fields are
 * invented — anything missing simply renders as unavailable.
 */

export type ApiEnvelope<T> = { success: boolean; data: T };

export type Pagination = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

export function pickList<T>(data: unknown, key: string): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const direct = record[key];
    if (Array.isArray(direct)) return direct as T[];
    for (const value of Object.values(record)) {
      if (Array.isArray(value)) return value as T[];
    }
  }
  return [];
}

export function pickRecord<T>(data: unknown, key: string): T | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const direct = record[key];
  if (direct && typeof direct === "object") return direct as T;
  return record as T;
}

export function pickPagination(data: unknown): Pagination | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const pagination = record["pagination"];
  if (pagination && typeof pagination === "object") return pagination as Pagination;
  return null;
}
