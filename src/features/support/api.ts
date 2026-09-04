import { apiDownload, apiRequest } from "@/lib/api/client";
import { getAuthToken } from "@/lib/auth/token";
import type { ApiEnvelope } from "@/lib/api/envelope";

export type SupportStatus = "open" | "resolved";
export type SupportPriority = "low" | "medium" | "high";

export type SupportCategory =
  | "order"
  | "payment"
  | "tutoring"
  | "resource"
  | "account"
  | "consulting"
  | "procurement"
  | "other";

export type SupportAttachment = {
  id?: string | number | null;
  file_id?: string | number | null;
  file_name?: string | null;
  filename?: string | null;
  original_name?: string | null;
  name?: string | null;
  mime_type?: string | null;
  file_size?: string | number | null;
  download_url?: string | null;
  url?: string | null;
};

export type SupportMessage = {
  id: string | number;
  message: string;
  body?: string | null;
  sender_type?: string | null;
  sender_name?: string | null;
  sender_email?: string | null;
  sender_role?: string | null;
  role?: string | null;
  created_at?: string | null;
  attachments?: SupportAttachment[];
  attachment?: SupportAttachment | null;
};

export type SupportTicket = {
  id: string | number;
  ticket_number?: string | null;
  subject: string;
  category: SupportCategory | string;
  priority?: SupportPriority | string | null;
  status: SupportStatus | string;
  updated_at?: string | null;
  last_message_at?: string | null;
  created_at?: string | null;
  messages?: SupportMessage[];
};

export type CreateSupportTicketInput = {
  subject: string;
  category: SupportCategory;
  priority: SupportPriority;
  message: string;
  attachment?: File | null;
};

export type CreateSupportMessageInput = {
  ticketId: string | number;
  message: string;
  attachment?: File | null;
};

function token() {
  return getAuthToken();
}

function recordOf(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function arrayOf<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function ticketsFrom(value: unknown): SupportTicket[] {
  const data = recordOf(value);
  if (Array.isArray(value)) return value as SupportTicket[];
  if (Array.isArray(data.tickets)) return data.tickets as SupportTicket[];
  if (Array.isArray(data.support_tickets)) return data.support_tickets as SupportTicket[];
  return [];
}

function ticketFrom(value: unknown): SupportTicket | null {
  const data = recordOf(value);
  const ticket = recordOf(data.ticket ?? data.support_ticket ?? data);
  if (!ticket.id) return null;
  return {
    ...(ticket as SupportTicket),
    messages: arrayOf<SupportMessage>(data.messages ?? ticket.messages),
  };
}

function supportFormData(input: {
  subject?: string;
  category?: string;
  priority?: SupportPriority;
  message: string;
  attachment?: File | null;
}) {
  const formData = new FormData();
  if (input.subject !== undefined) formData.append("subject", input.subject);
  if (input.category !== undefined) formData.append("category", input.category);
  if ("priority" in input && input.priority !== undefined) {
    formData.append("priority", input.priority);
  }
  formData.append("message", input.message);
  if (input.attachment) formData.append("attachment", input.attachment);
  return formData;
}

export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  const res = await apiRequest<ApiEnvelope<unknown>>("/support/tickets", {
    token: token(),
  });
  return ticketsFrom(res.data);
}

export async function fetchSupportTicket(id: string | number): Promise<SupportTicket | null> {
  const res = await apiRequest<ApiEnvelope<unknown>>(`/support/tickets/${id}`, {
    token: token(),
  });
  return ticketFrom(res.data);
}

export async function createSupportTicket(
  input: CreateSupportTicketInput,
): Promise<SupportTicket | null> {
  const res = await apiRequest<ApiEnvelope<unknown>>("/support/tickets", {
    method: "POST",
    token: token(),
    ...(input.attachment
      ? { formData: supportFormData(input) }
      : {
          body: {
            subject: input.subject,
            category: input.category,
            priority: input.priority,
            message: input.message,
          },
        }),
  });
  return ticketFrom(res.data);
}

export async function createSupportMessage(input: CreateSupportMessageInput) {
  const res = await apiRequest<ApiEnvelope<unknown>>(
    `/support/tickets/${input.ticketId}/messages`,
    {
      method: "POST",
      token: token(),
      ...(input.attachment
        ? { formData: supportFormData({ message: input.message, attachment: input.attachment }) }
        : { body: { message: input.message } }),
    },
  );
  return res.data;
}

export async function downloadSupportAttachment(downloadUrl: string) {
  return apiDownload(normalizeDownloadPath(downloadUrl), token());
}

function normalizeDownloadPath(url: string) {
  try {
    const parsed = new URL(url, window.location.origin);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
}
