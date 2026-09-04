import { useRef, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { ArrowLeft, Download, FileText, Upload } from "lucide-react";
import { toast } from "sonner";

import { RoleLink } from "@/components/shared/RoleLink";
import { DetailPageLoading, PanelLoading } from "@/components/shared/LoadingState";
import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/button-loading";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import {
  downloadSupportAttachment,
  type SupportAttachment,
  type SupportMessage,
} from "@/features/support/api";
import { useCreateSupportMessage, useSupportTicket } from "@/features/support/hooks";
import {
  attachmentDownloadUrl,
  attachmentName,
  supportCategoryLabel,
  supportStatusBadge,
  supportTicketNumber,
  validateSupportAttachment,
} from "@/features/support/format";
import { describeApiError } from "@/lib/api/errors";
import { formatDateTime } from "@/features/commerce/format";

const MAX_MESSAGE_LENGTH = 10000;

export function SupportTicketDetailsPage() {
  const { ticketId } = useParams({ strict: false }) as { ticketId: string };
  const ticketQuery = useSupportTicket(ticketId);
  const reply = useCreateSupportMessage(ticketId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [activeDownload, setActiveDownload] = useState<string | null>(null);

  if (ticketQuery.isLoading) {
    return (
      <AppShell>
        <DetailPageLoading
          title="Loading support request..."
          message="Loading this conversation..."
        />
      </AppShell>
    );
  }

  if (ticketQuery.isError || !ticketQuery.data) {
    return (
      <AppShell>
        <PageHeader
          title="Support request not found"
          description={describeApiError(
            ticketQuery.error,
            "This support request does not exist or is not available on your account.",
          )}
        />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <Button asChild variant="outline">
            <RoleLink to="/support">Back to support</RoleLink>
          </Button>
        </section>
      </AppShell>
    );
  }

  const ticket = ticketQuery.data;
  const badge = supportStatusBadge(ticket.status);
  const resolved = ticket.status === "resolved";
  const messages = ticket.messages ?? [];
  const invalidReply =
    message.trim().length === 0 || message.trim().length > MAX_MESSAGE_LENGTH || Boolean(fileError);

  const submitReply = () => {
    if (resolved || invalidReply || reply.isPending) return;
    setReplyError(null);
    reply.mutate(
      {
        ticketId: ticket.id,
        message: message.trim(),
        attachment,
      },
      {
        onSuccess: () => {
          setMessage("");
          setAttachment(null);
          setFileError(null);
          if (inputRef.current) inputRef.current.value = "";
          toast.success("Reply sent.");
        },
        onError: (error) => {
          setReplyError(describeApiError(error, "Your reply could not be sent."));
        },
      },
    );
  };

  const download = async (attachmentRecord: SupportAttachment) => {
    const url = attachmentDownloadUrl(attachmentRecord);
    if (!url) {
      setDownloadError("This attachment is not available for download.");
      return;
    }

    setDownloadError(null);
    setActiveDownload(url);
    try {
      const blob = await downloadSupportAttachment(url);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = attachmentName(attachmentRecord);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success("Attachment download started.");
    } catch (error) {
      setDownloadError(describeApiError(error, "This attachment could not be downloaded."));
    } finally {
      setActiveDownload(null);
    }
  };

  return (
    <AppShell>
      <RoleLink
        to="/support"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Back to support
      </RoleLink>

      <PageHeader
        title={ticket.subject}
        description={`${supportTicketNumber(ticket)} · ${supportCategoryLabel(ticket.category)} · ${formatDateTime(
          ticket.last_message_at ?? ticket.updated_at ?? ticket.created_at,
        )}`}
        actions={<StatusBadge label={badge.label} tone={badge.tone} />}
      />

      {downloadError && (
        <p className="mb-4 bg-danger-soft px-3 py-2.5 text-xs text-danger">{downloadError}</p>
      )}

      <section className="border border-border bg-card">
        <header className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold tracking-tight text-foreground">Conversation</h2>
        </header>

        {ticketQuery.isFetching ? (
          <PanelLoading message="Refreshing conversation..." />
        ) : messages.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No messages have been recorded for this support request yet.
          </p>
        ) : (
          <ol className="space-y-4 px-5 py-5">
            {messages.map((item) => (
              <li key={String(item.id)}>
                <MessageCard message={item} activeDownload={activeDownload} onDownload={download} />
              </li>
            ))}
          </ol>
        )}
      </section>

      {!resolved && (
        <section className="mt-5 border border-border bg-card">
          <header className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold tracking-tight text-foreground">Reply</h2>
          </header>
          <div className="grid gap-4 px-5 py-5">
            <Textarea
              value={message}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={5}
              onChange={(event) => setMessage(event.target.value)}
            />
            <div>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="sr-only"
                onChange={(event) => {
                  const selected = event.target.files?.[0] ?? null;
                  setReplyError(null);
                  setFileError(null);
                  if (!selected) {
                    setAttachment(null);
                    return;
                  }
                  const invalidFile = validateSupportAttachment(selected);
                  setFileError(invalidFile);
                  setAttachment(invalidFile ? null : selected);
                }}
              />
              <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                <Upload className="h-4 w-4" strokeWidth={2} />
                Attach file
              </Button>
              {attachment && (
                <p className="mt-3 flex items-center gap-2 border border-border bg-card px-3 py-2.5 text-xs text-foreground">
                  <FileText
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={2}
                  />
                  <span className="truncate">{attachment.name}</span>
                </p>
              )}
              {fileError && (
                <p className="mt-3 bg-danger-soft px-3 py-2.5 text-xs text-danger">{fileError}</p>
              )}
            </div>
            {replyError && (
              <p className="bg-danger-soft px-3 py-2.5 text-xs text-danger">{replyError}</p>
            )}
            <div className="flex justify-end">
              <Button disabled={invalidReply || reply.isPending} onClick={submitReply}>
                {reply.isPending ? <ButtonLoading>Sending...</ButtonLoading> : "Send reply"}
              </Button>
            </div>
          </div>
        </section>
      )}
    </AppShell>
  );
}

function MessageCard({
  message,
  activeDownload,
  onDownload,
}: {
  message: SupportMessage;
  activeDownload: string | null;
  onDownload: (attachment: SupportAttachment) => void;
}) {
  const supportMessage = isSupportMessage(message);
  const primarySender = supportMessage ? "Support" : message.sender_name || "You";
  const secondarySender = senderSecondaryInfo(message, supportMessage);
  const attachments = [
    ...(message.attachments ?? []),
    ...(message.attachment ? [message.attachment] : []),
  ];

  return (
    <article
      className={
        supportMessage
          ? "border border-border bg-muted px-4 py-4"
          : "border border-border bg-card px-4 py-4"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{primarySender}</p>
          {secondarySender && (
            <p className="mt-0.5 text-xs text-muted-foreground">{secondarySender}</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{formatDateTime(message.created_at)}</p>
      </div>
      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground">
        {message.message || message.body || ""}
      </p>
      {attachments.length > 0 && (
        <ul className="mt-4 space-y-2">
          {attachments.map((attachment, index) => {
            const url = attachmentDownloadUrl(attachment);
            return (
              <li
                key={String(
                  attachment.id ?? attachment.file_id ?? `${attachmentName(attachment)}-${index}`,
                )}
                className="flex flex-wrap items-center justify-between gap-2 border border-border bg-background px-3 py-2.5"
              >
                <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-foreground">
                  <FileText
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={2}
                  />
                  <span className="truncate">{attachmentName(attachment)}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!url || activeDownload === url}
                  onClick={() => onDownload(attachment)}
                >
                  <Download className="h-4 w-4" strokeWidth={2} />
                  Download
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}

function isSupportMessage(message: SupportMessage) {
  const role = String(
    message.sender_type ?? message.sender_role ?? message.role ?? "",
  ).toLowerCase();
  return role.includes("admin") || role.includes("support");
}

function senderSecondaryInfo(message: SupportMessage, supportMessage: boolean) {
  return [message.sender_email, supportMessage ? "Support" : "Customer"]
    .filter(Boolean)
    .join(" · ");
}
