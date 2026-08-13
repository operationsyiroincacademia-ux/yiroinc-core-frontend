import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { RoleLink } from "@/components/shared/RoleLink";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EXAM_LEVEL_OPTIONS,
  EXAM_TYPE_OPTIONS,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/features/tutoring/preview-data";

/**
 * Only the fields supported by the backend are collected here:
 * exam_type, exam_level, preferred_timezone, preferred_language and
 * additional_notes. At integration time this form posts those exact fields
 * to the create tutoring request endpoint; the option lists come from the
 * tutoring data module (preview values during the visual stage).
 */

type Form = {
  examType: string;
  examLevel: string;
  timezone: string;
  language: string;
  notes: string;
};

type Errors = Partial<Record<keyof Form, string>>;

const EMPTY: Form = {
  examType: "",
  examLevel: "",
  timezone: "",
  language: "",
  notes: "",
};

const SELECT_CLASS =
  "h-11 w-full border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      {message}
    </p>
  );
}

export function NewTutoringRequestPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted">("idle");

  const set = (key: keyof Form) => (value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "examType" ? { examLevel: "" } : null),
    }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus("idle");
  };

  const levels = EXAM_LEVEL_OPTIONS[form.examType] ?? [];

  const validate = (): Errors => {
    const next: Errors = {};
    if (!form.examType) next.examType = "Select an exam type.";
    if (!form.examLevel) next.examLevel = "Select an exam level.";
    if (!form.timezone) next.timezone = "Select your preferred timezone.";
    if (!form.language) next.language = "Select your preferred language.";
    if (form.notes.length > 1000)
      next.notes = "Notes must be 1000 characters or fewer.";
    return next;
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus("idle");
      return;
    }
    setStatus("submitting");
    // Visual stage only — the create request call is wired at API integration.
    window.setTimeout(() => setStatus("submitted"), 500);
  };

  return (
    <AppShell>
      <RoleLink
        to="/tutoring"
        className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to tutoring requests
      </RoleLink>

      <PageHeader
        title="New tutoring request"
        description="Tell us what you are preparing for and how you prefer to be tutored."
      />

      {status === "submitted" && (
        <div className="mb-6 flex items-start gap-3 bg-success-soft px-5 py-4">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" strokeWidth={2} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Tutoring request submitted
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Your request is now under review. You will be notified once a tutor is
              matched.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => navigate({ to: "/exam/tutoring" })}
            >
              View my tutoring requests
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="max-w-3xl">
        <section className="border border-border bg-card">
          <header className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              Request details
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              All fields are required except additional notes.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="examType">Exam type</Label>
              <select
                id="examType"
                className={SELECT_CLASS}
                value={form.examType}
                onChange={(event) => set("examType")(event.target.value)}
              >
                <option value="">Select exam type</option>
                {EXAM_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <FieldError message={errors.examType} />
            </div>

            <div>
              <Label htmlFor="examLevel">Exam level</Label>
              <select
                id="examLevel"
                className={SELECT_CLASS}
                value={form.examLevel}
                disabled={!form.examType}
                onChange={(event) => set("examLevel")(event.target.value)}
              >
                <option value="">
                  {form.examType ? "Select exam level" : "Select an exam type first"}
                </option>
                {levels.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <FieldError message={errors.examLevel} />
            </div>

            <div>
              <Label htmlFor="timezone">Preferred timezone</Label>
              <select
                id="timezone"
                className={SELECT_CLASS}
                value={form.timezone}
                onChange={(event) => set("timezone")(event.target.value)}
              >
                <option value="">Select timezone</option>
                {TIMEZONE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <FieldError message={errors.timezone} />
            </div>

            <div>
              <Label htmlFor="language">Preferred language</Label>
              <select
                id="language"
                className={SELECT_CLASS}
                value={form.language}
                onChange={(event) => set("language")(event.target.value)}
              >
                <option value="">Select language</option>
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <FieldError message={errors.language} />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="notes">Additional notes (optional)</Label>
              <Textarea
                id="notes"
                rows={5}
                value={form.notes}
                onChange={(event) => set("notes")(event.target.value)}
                placeholder="Topics you want to focus on, availability, or anything else your tutor should know."
              />
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <FieldError message={errors.notes} />
                <p className="ml-auto text-xs text-muted-foreground">
                  {form.notes.length}/1000
                </p>
              </div>
            </div>
          </div>

          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-4">
            <Button asChild variant="outline" type="button">
              <RoleLink to="/tutoring">Cancel</RoleLink>
            </Button>
            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Submitting…" : "Submit request"}
            </Button>
          </footer>
        </section>
      </form>
    </AppShell>
  );
}
