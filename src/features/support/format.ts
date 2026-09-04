import type { StatusTone } from "@/components/ui/status-badge";

import type { SupportAttachment, SupportCategory, SupportPriority, SupportStatus } from "./api";

export const SUPPORT_CATEGORIES: { label: string; value: SupportCategory }[] = [
  { label: "Order", value: "order" },
  { label: "Payment", value: "payment" },
  { label: "Tutoring", value: "tutoring" },
  { label: "Resource", value: "resource" },
  { label: "Account", value: "account" },
  { label: "Consulting", value: "consulting" },
  { label: "Procurement", value: "procurement" },
  { label: "Other", value: "other" },
];

export const ACCEPTED_SUPPORT_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export function supportStatusBadge(status: string): { label: string; tone: StatusTone } {
  if (status === "awaiting_admin" || status === "awaiting_user") {
    return { label: "Open", tone: "info" };
  }
  const labels: Record<SupportStatus, { label: string; tone: StatusTone }> = {
    open: { label: "Open", tone: "info" },
    resolved: { label: "Resolved", tone: "success" },
  };
  return labels[status as SupportStatus] ?? { label: "Support request", tone: "neutral" };
}

export function adminSupportStatusBadge(status: string): { label: string; tone: StatusTone } {
  if (status === "awaiting_admin" || status === "awaiting_user") {
    return { label: "Open", tone: "info" };
  }
  const labels: Record<SupportStatus, { label: string; tone: StatusTone }> = {
    open: { label: "Open", tone: "info" },
    resolved: { label: "Resolved", tone: "success" },
  };
  return labels[status as SupportStatus] ?? { label: "Support request", tone: "neutral" };
}

export function supportPriorityBadge(priority: string | null | undefined): {
  label: string;
  tone: StatusTone;
} {
  const labels: Record<SupportPriority, { label: string; tone: StatusTone }> = {
    low: { label: "Low", tone: "success" },
    medium: { label: "Medium", tone: "warning" },
    high: { label: "High", tone: "danger" },
  };
  return labels[(priority ?? "medium") as SupportPriority] ?? labels.medium;
}

export function supportCategoryLabel(category: string) {
  return SUPPORT_CATEGORIES.find((item) => item.value === category)?.label ?? "Other";
}

export function supportTicketNumber(ticket: {
  id: string | number;
  ticket_number?: string | null;
}) {
  return ticket.ticket_number ?? `#${String(ticket.id).padStart(6, "0")}`;
}

export function attachmentName(attachment: SupportAttachment) {
  return (
    attachment.file_name ??
    attachment.filename ??
    attachment.original_name ??
    attachment.name ??
    "Attachment"
  );
}

export function attachmentDownloadUrl(attachment: SupportAttachment) {
  return attachment.download_url ?? attachment.url ?? null;
}

export function validateSupportAttachment(file: File): string | null {
  if (!ACCEPTED_SUPPORT_ATTACHMENT_TYPES.includes(file.type)) {
    return "Unsupported file type. Upload a JPG, PNG, WEBP image or a PDF.";
  }
  return null;
}
