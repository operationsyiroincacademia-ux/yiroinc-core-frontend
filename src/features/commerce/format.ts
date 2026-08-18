/**
 * Shared commerce formatting and verified status label mapping.
 * Status strings are never invented — unknown values fall back to the raw
 * value returned by the API.
 */

import type { StatusTone } from "@/components/ui/status-badge";

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function paymentStatusLabel(
  status: string,
  hasProof: boolean,
): { label: string; tone: StatusTone } {
  if (status === "verified") return { label: "Verified", tone: "success" };
  if (status === "rejected") return { label: "Rejected", tone: "danger" };
  if (status === "submitted") return { label: "Submitted", tone: "info" };
  if (status === "pending") {
    return hasProof
      ? { label: "Awaiting verification", tone: "info" }
      : { label: "Proof required", tone: "warning" };
  }
  return { label: status, tone: "neutral" };
}

const ORDER_STATUS_LABELS: Record<string, { label: string; tone: StatusTone }> = {
  awaiting_payment: { label: "Awaiting payment", tone: "warning" },
  under_review: { label: "Under review", tone: "info" },
  processing: { label: "Processing", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  in_progress: { label: "In progress", tone: "info" },
};

export function orderStatusLabel(status: string): { label: string; tone: StatusTone } {
  return ORDER_STATUS_LABELS[status] ?? { label: status, tone: "neutral" };
}

export const MAX_PROOF_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export function validateProofFile(file: File): string | null {
  if (!ACCEPTED_PROOF_TYPES.includes(file.type)) {
    return "Unsupported file type. Upload a JPG, PNG, WEBP image or a PDF.";
  }
  if (file.size > MAX_PROOF_BYTES) {
    return "File is too large. The maximum size is 5 MB.";
  }
  return null;
}

/** Database numerics arrive as strings ("150000.00"); convert safely. */
export function toNumber(value: string | number | null | undefined): number {
  const parsed = typeof value === "number" ? value : Number(value ?? NaN);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Verified fulfilment statuses. */
const FULFILLMENT_LABELS: Record<string, string> = {
  not_started: "Not started",
  processing: "Processing",
  ready: "Ready",
  dispatched: "Dispatched",
  fulfilled: "Fulfilled",
};

export function humaniseStatus(status: string): string {
  if (!status) return "—";
  return (
    FULFILLMENT_LABELS[status] ?? status.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())
  );
}

/** Verified payment verification states. Unknown values pass through raw. */
export function paymentBadge(
  status: string | null | undefined,
  hasProof: boolean,
): { label: string; tone: StatusTone } {
  const value = String(status ?? "");
  if (value === "verified") return { label: "Verified", tone: "success" };
  if (value === "rejected") return { label: "Rejected", tone: "danger" };
  if (value === "submitted") return { label: "Submitted", tone: "info" };
  if (value === "pending") {
    return hasProof
      ? { label: "Awaiting verification", tone: "info" }
      : { label: "Proof required", tone: "warning" };
  }
  return { label: value || "—", tone: "neutral" };
}

/** Truthy flags arrive as 1/"1"/true depending on the column. */
export function toFlag(value: string | number | boolean | null | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (value === null || value === undefined) return false;
  const raw = String(value).toLowerCase();
  return raw === "1" || raw === "true";
}

/** API timestamps ("2026-07-30 14:22:05") formatted for display. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const parsed = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const parsed = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return value;
  return `${parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })} · ${parsed.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}
