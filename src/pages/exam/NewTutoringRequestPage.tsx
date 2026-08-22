import { useState, type FormEvent } from "react";
import { RoleLink } from "@/components/shared/RoleLink";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/button-loading";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { describeApiError } from "@/lib/api/errors";
import { useCreateTutorRequest } from "@/features/tutoring/hooks";
import {
  EXAM_LEVEL_OPTIONS,
  EXAM_TYPE_OPTIONS,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/features/tutoring/preview-data";

/**
 * Only the fields supported by POST /tutor-requests are collected here:
 * exam_type, exam_level, preferred_timezone, preferred_language and
 * additional_notes. The backend requires exam_type; the remaining fields are
 * optional and are omitted when left blank.
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
  const createRequest = useCreateTutorRequest();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  const set = (key: keyof Form) => (value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "examType" ? { examLevel: "" } : null),
    }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const levels = EXAM_LEVEL_OPTIONS[form.examType] ?? [];

  const validate = (): Errors => {
    const next: Errors = {};
    if (!form.examType) next.examType = "Select an exam type.";
    if (form.examType.length > 100) next.examType = "Exam type must be 100 characters or fewer.";
    if (form.examLevel.length > 100) next.examLevel = "Exam level must be 100 characters or fewer.";
    if (form.timezone.length > 100) next.timezone = "Timezone must be 100 characters or fewer.";
    if (form.language.length > 100) next.language = "Language must be 100 characters or fewer.";
    if (form.notes.length > 2000) next.notes = "Notes must be 2000 characters or fewer.";
    return next;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return;
    }
    try {
      await createRequest.mutateAsync({
        exam_type: form.examType,
        exam_level: optional(form.examLevel),
        preferred_timezone: optional(form.timezone),
        preferred_language: optional(form.language),
        additional_notes: optional(form.notes),
      });
      setForm(EMPTY);
      toast.success("Tutoring request submitted.", {
        description: "You will be notified once a tutor is matched.",
      });
    } catch {
      return;
    }
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

      {createRequest.isError && (
        <div className="mb-6 bg-danger-soft px-5 py-4 text-sm text-danger">
          {describeApiError(createRequest.error, "Your tutoring request could not be submitted.")}
        </div>
      )}

      <form onSubmit={onSubmit} className="max-w-3xl">
        <section className="border border-border bg-card">
          <header className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold tracking-tight text-foreground">Request details</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Exam type is required. Other fields help us match the request.
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
                  <option key={option.value} value={option.value}>
                    {option.label}
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
                <p className="ml-auto text-xs text-muted-foreground">{form.notes.length}/2000</p>
              </div>
            </div>
          </div>

          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-4">
            <Button asChild variant="outline" type="button">
              <RoleLink to="/tutoring">Cancel</RoleLink>
            </Button>
            <Button
              type="submit"
              disabled={createRequest.isPending}
              aria-busy={createRequest.isPending}
            >
              {createRequest.isPending ? (
                <ButtonLoading>Submitting...</ButtonLoading>
              ) : (
                "Submit request"
              )}
            </Button>
          </footer>
        </section>
      </form>
    </AppShell>
  );
}

function optional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
