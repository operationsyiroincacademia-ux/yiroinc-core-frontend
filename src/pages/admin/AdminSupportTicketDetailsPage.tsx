import { useRef, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, FileText, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";

import { DetailPageLoading, PanelLoading } from "@/components/shared/LoadingState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/button-loading";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import type { AdminSupportTicketDetails } from "@/features/admin/api";
import {
  useAdminSupportTicket,
  useCreateAdminSupportMessage,
  useUpdateAdminSupportTicketStatus,
} from "@/features/admin/hooks";
import type { SupportMessage } from "@/features/support/api";
import { SupportAttachmentPreview } from "@/features/support/components/SupportAttachmentPreview";
import {
  adminSupportStatusBadge,
  supportPriorityBadge,
  supportCategoryLabel,
  supportTicketNumber,
  validateSupportAttachment,
} from "@/features/support/format";
import { formatDateTime } from "@/features/commerce/format";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";

const MAX_MESSAGE_LENGTH = 10000;

export function AdminSupportTicketDetailsPage() {
  const { ticketId } = useParams({ strict: false }) as { ticketId: string };
  const ticketQuery = useAdminSupportTicket(ticketId);
  const reply = useCreateAdminSupportMessage(ticketId);
  const updateStatus = useUpdateAdminSupportTicketStatus(ticketId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (ticketQuery.isLoading) {
    return (
      <AdminLayout>
        <DetailPageLoading
          title="Loading support ticket..."
          message="Loading this support conversation..."
        />
      </AdminLayout>
    );
  }

  if (ticketQuery.isError || !ticketQuery.data) {
    return (
      <AdminLayout>
        <PageHeader
          title="Support ticket not found"
          description={describeApiError(
            ticketQuery.error,
            "This support ticket does not exist or is not available.",
          )}
        />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <Button asChild variant="outline">
            <Link to="/admin/support">Back to support</Link>
          </Button>
        </section>
      </AdminLayout>
    );
  }

  const ticket = ticketQuery.data;
  const badge = adminSupportStatusBadge(ticket.status);
  const resolved = ticket.status === "resolved";
  const invalidReply =
    message.trim().length === 0 || message.trim().length > MAX_MESSAGE_LENGTH || Boolean(fileError);

  const submitReply = () => {
    if (resolved || invalidReply || reply.isPending) return;
    setReplyError(null);
    reply.mutate(
      { message: message.trim(), attachment },
      {
        onSuccess: () => {
          setMessage("");
          setAttachment(null);
          setFileError(null);
          if (inputRef.current) inputRef.current.value = "";
          toast.success("Support reply sent.");
        },
        onError: (error) => {
          setReplyError(describeApiError(error, "Your reply could not be sent."));
        },
      },
    );
  };

  const changeStatus = (status: "open" | "resolved") => {
    setActionError(null);
    updateStatus.mutate(status, {
      onSuccess: () => {
        toast.success(
          status === "resolved" ? "Support ticket resolved." : "Support ticket reopened.",
        );
      },
      onError: (error) => {
        setActionError(describeApiError(error, "Support ticket status could not be updated."));
      },
    });
  };

  return (
    <AdminLayout>
      <Link
        to="/admin/support"
        className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to support
      </Link>

      <PageHeader
        title={ticket.subject}
        description={`${supportTicketNumber(ticket)} · ${supportCategoryLabel(ticket.category)} · ${formatDateTime(
          lastActivity(ticket),
        )}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={badge.label} tone={badge.tone} />
            {resolved ? (
              <Button
                variant="outline"
                size="sm"
                disabled={updateStatus.isPending}
                onClick={() => changeStatus("open")}
              >
                <RefreshCw className="h-4 w-4" strokeWidth={2} />
                Reopen ticket
              </Button>
            ) : (
              <ResolveDialog
                disabled={updateStatus.isPending}
                onConfirm={() => changeStatus("resolved")}
              />
            )}
          </div>
        }
      />

      {actionError && (
        <p className="mb-4 bg-danger-soft px-3 py-2.5 text-xs text-danger">{actionError}</p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="border border-border bg-card">
            <header className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-bold tracking-tight text-foreground">Conversation</h2>
            </header>

            {ticketQuery.isFetching ? (
              <PanelLoading message="Refreshing conversation..." />
            ) : ticket.messages.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                No messages have been recorded for this support ticket yet.
              </p>
            ) : (
              <ol className="space-y-4 px-5 py-5">
                {ticket.messages.map((item) => (
                  <li key={String(item.id)}>
                    <MessageCard message={item} />
                  </li>
                ))}
              </ol>
            )}
          </section>

          {resolved ? (
            <section className="border border-border bg-card px-5 py-5">
              <p className="text-sm font-semibold text-foreground">This ticket is resolved.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Reopen the ticket before sending another support reply.
              </p>
            </section>
          ) : (
            <ReplyComposer
              message={message}
              attachment={attachment}
              fileError={fileError}
              replyError={replyError}
              inputRef={inputRef}
              pending={reply.isPending}
              invalid={invalidReply}
              onMessageChange={setMessage}
              onAttachmentChange={(file, error) => {
                setReplyError(null);
                setFileError(error);
                setAttachment(error ? null : file);
              }}
              onSubmit={submitReply}
            />
          )}
        </div>

        <aside className="space-y-6">
          <Panel title="Ticket details">
            <dl className="grid gap-4 px-5 py-5">
              <Field label="Customer">{customerName(ticket)}</Field>
              <Field label="Email">{customerEmail(ticket)}</Field>
              <Field label="Category">{supportCategoryLabel(ticket.category)}</Field>
              <Field label="Priority">
                <PriorityBadge priority={ticket.priority} />
              </Field>
              <Field label="Created">{formatDateTime(ticket.created_at)}</Field>
              <Field label="Last activity">{formatDateTime(lastActivity(ticket))}</Field>
            </dl>
          </Panel>
        </aside>
      </div>
    </AdminLayout>
  );
}

function ReplyComposer({
  message,
  attachment,
  fileError,
  replyError,
  inputRef,
  pending,
  invalid,
  onMessageChange,
  onAttachmentChange,
  onSubmit,
}: {
  message: string;
  attachment: File | null;
  fileError: string | null;
  replyError: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  pending: boolean;
  invalid: boolean;
  onMessageChange: (value: string) => void;
  onAttachmentChange: (file: File | null, error: string | null) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="border border-border bg-card">
      <header className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-bold tracking-tight text-foreground">Support reply</h2>
      </header>
      <div className="grid gap-4 px-5 py-5">
        <Textarea
          value={message}
          maxLength={MAX_MESSAGE_LENGTH}
          rows={5}
          onChange={(event) => onMessageChange(event.target.value)}
        />
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="sr-only"
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              if (!selected) {
                onAttachmentChange(null, null);
                return;
              }
              onAttachmentChange(selected, validateSupportAttachment(selected));
            }}
          />
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <Upload className="h-4 w-4" strokeWidth={2} />
            Attach file
          </Button>
          {attachment && (
            <p className="mt-3 flex items-center gap-2 border border-border bg-card px-3 py-2.5 text-xs text-foreground">
              <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={2} />
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
          <Button disabled={invalid || pending} onClick={onSubmit}>
            {pending ? <ButtonLoading>Sending...</ButtonLoading> : "Send reply"}
          </Button>
        </div>
      </div>
    </section>
  );
}

function ResolveDialog({ disabled, onConfirm }: { disabled: boolean; onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          Mark as resolved
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark this support request as resolved?</AlertDialogTitle>
          <AlertDialogDescription>
            You can reopen it later if you need further help.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Mark as resolved</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function MessageCard({ message }: { message: SupportMessage }) {
  const adminMessage = isAdminMessage(message);
  const primarySender = adminMessage ? "Support" : message.sender_name || "Customer";
  const secondarySender = senderSecondaryInfo(message, adminMessage);
  const attachments = [
    ...(message.attachments ?? []),
    ...(message.attachment ? [message.attachment] : []),
  ];

  return (
    <article
      className={
        adminMessage
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
          {attachments.map((attachmentRecord, index) => (
            <li key={String(attachmentRecord.id ?? attachmentRecord.file_id ?? index)}>
              <SupportAttachmentPreview attachment={attachmentRecord} />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border bg-card">
      <header className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-bold tracking-tight text-foreground">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 min-w-0 text-sm text-foreground">{children || "Not provided"}</dd>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string | null | undefined }) {
  const badge = supportPriorityBadge(priority);
  return <StatusBadge label={badge.label} tone={badge.tone} />;
}

function isAdminMessage(message: SupportMessage) {
  const role = String(
    message.sender_type ?? message.sender_role ?? message.role ?? "",
  ).toLowerCase();
  return role.includes("admin") || role.includes("support");
}

function senderSecondaryInfo(message: SupportMessage, adminMessage: boolean) {
  return [message.sender_email, adminMessage ? "Support" : "Customer"].filter(Boolean).join(" · ");
}

function customerName(ticket: AdminSupportTicketDetails) {
  const customer = customerRecord(ticket);
  const direct =
    ticket.user_name ??
    ticket.customer_name ??
    ticket.name ??
    stringValue(customer.name) ??
    stringValue(customer.display_name);
  const first = stringValue(customer.first_name);
  const last = stringValue(customer.last_name);
  const combined = [first, last].filter(Boolean).join(" ");
  return (direct ?? combined) || "Customer";
}

function customerEmail(ticket: AdminSupportTicketDetails) {
  const customer = customerRecord(ticket);
  return (
    ticket.user_email ??
    ticket.customer_email ??
    ticket.email ??
    stringValue(customer.email) ??
    "Not provided"
  );
}

function customerRecord(ticket: AdminSupportTicketDetails) {
  const record = ticket.customer ?? ticket.user;
  return record && typeof record === "object" ? (record as Record<string, unknown>) : {};
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function lastActivity(ticket: AdminSupportTicketDetails) {
  return ticket.last_message_at ?? ticket.updated_at ?? ticket.created_at;
}
