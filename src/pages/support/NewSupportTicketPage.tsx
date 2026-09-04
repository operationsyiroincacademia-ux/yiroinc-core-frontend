import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileText, Upload } from "lucide-react";
import { toast } from "sonner";

import { RoleLink } from "@/components/shared/RoleLink";
import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/button-loading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { describeApiError } from "@/lib/api/errors";
import { roleHref, useExperience } from "@/lib/roles/experience-context";
import { type SupportCategory, type SupportPriority } from "@/features/support/api";
import { useCreateSupportTicket } from "@/features/support/hooks";
import { SUPPORT_CATEGORIES, validateSupportAttachment } from "@/features/support/format";

const MAX_SUBJECT_LENGTH = 255;
const MAX_MESSAGE_LENGTH = 10000;

export function NewSupportTicketPage() {
  const navigate = useNavigate();
  const experience = useExperience();
  const createTicket = useCreateSupportTicket();
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<SupportCategory>("order");
  const [priority, setPriority] = useState<SupportPriority>("medium");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const invalid =
    subject.trim().length === 0 ||
    subject.trim().length > MAX_SUBJECT_LENGTH ||
    message.trim().length === 0 ||
    message.trim().length > MAX_MESSAGE_LENGTH ||
    Boolean(fileError);

  const submit = () => {
    if (invalid || createTicket.isPending) return;
    setSubmitError(null);
    createTicket.mutate(
      {
        category,
        priority,
        subject: subject.trim(),
        message: message.trim(),
        attachment,
      },
      {
        onSuccess: (ticket) => {
          toast.success("Support request sent.");
          navigate({
            to: roleHref(experience, ticket?.id ? `/support/${ticket.id}` : "/support"),
          });
        },
        onError: (error) => {
          setSubmitError(describeApiError(error, "Your support request could not be sent."));
        },
      },
    );
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
        title="Contact Support"
        description="Send a support request to YiroInc Academia."
      />

      <section className="border border-border bg-card">
        <div className="grid gap-5 px-5 py-5">
          <div className="grid gap-2">
            <Label htmlFor="support-category">Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as SupportCategory)}
            >
              <SelectTrigger id="support-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORT_CATEGORIES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="support-priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as SupportPriority)}
            >
              <SelectTrigger id="support-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="support-subject">Subject</Label>
            <Input
              id="support-subject"
              value={subject}
              maxLength={MAX_SUBJECT_LENGTH}
              onChange={(event) => setSubject(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="support-message">Message</Label>
            <Textarea
              id="support-message"
              value={message}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={8}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>

          <div>
            <Label>Optional attachment</Label>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                setSubmitError(null);
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
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-2 flex w-full flex-col items-center gap-2 border border-dashed border-border bg-muted px-4 py-8 text-center transition-colors hover:border-primary"
            >
              <Upload className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
              <span className="text-xs font-semibold text-foreground">Choose attachment</span>
              <span className="text-[11px] text-muted-foreground">JPG, PNG, WEBP or PDF</span>
            </button>
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

          {submitError && (
            <p className="bg-danger-soft px-3 py-2.5 text-xs text-danger">{submitError}</p>
          )}

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
            <Button asChild variant="outline">
              <RoleLink to="/support">Cancel</RoleLink>
            </Button>
            <Button disabled={invalid || createTicket.isPending} onClick={submit}>
              {createTicket.isPending ? <ButtonLoading>Sending...</ButtonLoading> : "Send request"}
            </Button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
