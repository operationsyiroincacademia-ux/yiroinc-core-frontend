import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminTutor, AdminTutorInput } from "@/features/admin/api";
import {
  EXAM_OPTIONS,
  LEVEL_OPTIONS,
  TIMEZONE_OPTIONS,
  normalizeStringList,
} from "@/features/admin/tutor-format";
import { describeApiError } from "@/lib/api/errors";

const SELECT_CLASS =
  "h-11 w-full border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60";

type TutorFormState = {
  name: string;
  email: string;
  whatsappNumber: string;
  examExpertise: string[];
  levels: string[];
  timezone: string;
  availability: "available" | "unavailable";
  bio: string;
  status: "active" | "inactive";
};

type Errors = Partial<Record<keyof TutorFormState, string>>;

const EMPTY_FORM: TutorFormState = {
  name: "",
  email: "",
  whatsappNumber: "",
  examExpertise: [],
  levels: [],
  timezone: "",
  availability: "available",
  bio: "",
  status: "active",
};

export function AdminTutorForm({
  tutor,
  submitLabel,
  isPending,
  error,
  onSubmit,
}: {
  tutor?: AdminTutor | null;
  submitLabel: string;
  isPending: boolean;
  error: unknown;
  onSubmit: (input: AdminTutorInput) => Promise<void>;
}) {
  const [form, setForm] = useState<TutorFormState>(() => formFromTutor(tutor));
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    setForm(formFromTutor(tutor));
  }, [tutor]);

  const visibleLevels = useMemo(
    () => form.examExpertise.flatMap((exam) => LEVEL_OPTIONS[exam] ?? []),
    [form.examExpertise],
  );

  const set = (key: keyof TutorFormState) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const toggleExpertise = (exam: string) => {
    setForm((current) => {
      const nextExpertise = current.examExpertise.includes(exam)
        ? current.examExpertise.filter((item) => item !== exam)
        : [...current.examExpertise, exam];
      const allowedLevels = new Set(nextExpertise.flatMap((item) => LEVEL_OPTIONS[item] ?? []));
      return {
        ...current,
        examExpertise: nextExpertise,
        levels: current.levels.filter((level) =>
          [...allowedLevels].some((option) => option.value === level),
        ),
      };
    });
    setErrors((current) => ({ ...current, examExpertise: undefined, levels: undefined }));
  };

  const toggleLevel = (level: string) => {
    setForm((current) => ({
      ...current,
      levels: current.levels.includes(level)
        ? current.levels.filter((item) => item !== level)
        : [...current.levels, level],
    }));
    setErrors((current) => ({ ...current, levels: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (form.email && !form.email.includes("@")) next.email = "Enter a valid email address.";
    if (form.whatsappNumber && !form.whatsappNumber.trim().startsWith("+")) {
      next.whatsappNumber = "Use international format, for example +2348012345678.";
    }
    if (form.examExpertise.length === 0) next.examExpertise = "Select at least one exam.";
    if (form.levels.length === 0) next.levels = "Select at least one level.";
    if (!form.timezone.trim()) next.timezone = "Timezone is required.";
    return next;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    await onSubmit({
      name: form.name.trim(),
      email: optional(form.email),
      whatsapp_number: optional(form.whatsappNumber),
      exam_expertise: form.examExpertise,
      levels: form.levels,
      timezone: optional(form.timezone),
      availability: form.availability,
      bio: optional(form.bio),
      status: form.status,
    });
  };

  return (
    <form onSubmit={submit} className="max-w-4xl">
      {error ? (
        <div className="mb-6 bg-danger-soft px-5 py-4 text-sm text-danger">
          {describeApiError(error, "Tutor could not be saved.")}
        </div>
      ) : null}

      <section className="border border-border bg-card">
        <header className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold tracking-tight text-foreground">Tutor information</h2>
        </header>

        <div className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(event) => set("name")(event.target.value)}
            />
            <FieldError message={errors.name} />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => set("email")(event.target.value)}
            />
            <FieldError message={errors.email} />
          </div>

          <div>
            <Label htmlFor="whatsapp">WhatsApp number</Label>
            <Input
              id="whatsapp"
              value={form.whatsappNumber}
              placeholder="+2348012345678"
              onChange={(event) => set("whatsappNumber")(event.target.value)}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Use international format, for example +2348012345678.
            </p>
            <FieldError message={errors.whatsappNumber} />
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              list="admin-tutor-timezones"
              value={form.timezone}
              placeholder="Africa/Lagos"
              onChange={(event) => set("timezone")(event.target.value)}
            />
            <datalist id="admin-tutor-timezones">
              {TIMEZONE_OPTIONS.map((timezone) => (
                <option key={timezone} value={timezone} />
              ))}
            </datalist>
            <FieldError message={errors.timezone} />
          </div>

          <div>
            <Label htmlFor="availability">Availability</Label>
            <select
              id="availability"
              className={SELECT_CLASS}
              value={form.availability}
              onChange={(event) => set("availability")(event.target.value)}
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className={SELECT_CLASS}
              value={form.status}
              onChange={(event) => set("status")(event.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <Label>Exam expertise</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAM_OPTIONS.map((exam) => (
                <button
                  key={exam}
                  type="button"
                  onClick={() => toggleExpertise(exam)}
                  className={
                    form.examExpertise.includes(exam)
                      ? "border border-primary bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
                      : "border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  }
                >
                  {exam}
                </button>
              ))}
            </div>
            <FieldError message={errors.examExpertise} />
          </div>

          <div className="sm:col-span-2">
            <Label>Levels taught</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {visibleLevels.length === 0 ? (
                <p className="text-sm text-muted-foreground">Select exam expertise first.</p>
              ) : (
                visibleLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => toggleLevel(level.value)}
                    className={
                      form.levels.includes(level.value)
                        ? "border border-primary bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
                        : "border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    }
                  >
                    {level.label}
                  </button>
                ))
              )}
            </div>
            <FieldError message={errors.levels} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={5}
              value={form.bio}
              onChange={(event) => set("bio")(event.target.value)}
            />
          </div>
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : submitLabel}
          </Button>
        </footer>
      </section>
    </form>
  );
}

function formFromTutor(tutor?: AdminTutor | null): TutorFormState {
  if (!tutor) return EMPTY_FORM;
  return {
    name: tutor.name ?? "",
    email: tutor.email ?? "",
    whatsappNumber: tutor.whatsapp_number ?? "",
    examExpertise: normalizeStringList(tutor.exam_expertise),
    levels: normalizeStringList(tutor.levels),
    timezone: tutor.timezone ?? "",
    availability: tutor.availability === "unavailable" ? "unavailable" : "available",
    bio: tutor.bio ?? "",
    status: tutor.status === "inactive" ? "inactive" : "active",
  };
}

function optional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}
