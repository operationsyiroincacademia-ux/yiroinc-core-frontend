import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { describeApiError } from "@/lib/api/errors";
import { useProfile, useUpdateProfile } from "@/features/profile/hooks";
import type { UpdateProfileInput } from "@/features/profile/api";
import { EXPERIENCE_LABEL, PROFILE_TYPE_LABEL } from "@/lib/roles";
import { useCurrentUser } from "@/lib/auth/current-user";

type Editable = {
  phone: string;
  organizationName: string;
  examType: string;
  examLevel: string;
  institution: string;
  areaOfInterest: string;
  country: string;
};

type Errors = Partial<Record<keyof Editable, string>>;

const EMPTY_FORM: Editable = {
  phone: "",
  organizationName: "",
  examType: "",
  examLevel: "",
  institution: "",
  areaOfInterest: "",
  country: "",
};

function valueOf(value: string | null | undefined): string {
  return value ?? "";
}

function nullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function ProfilePage() {
  const [form, setForm] = useState<Editable>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();

  // Profile type comes from the active account context, not from the page.
  const user = useCurrentUser();
  const profileTypeLabel = user.profileType
    ? PROFILE_TYPE_LABEL[user.profileType]
    : EXPERIENCE_LABEL[user.experience];

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    setForm({
      phone: valueOf(profile.phone),
      organizationName: valueOf(profile.organization_name),
      examType: valueOf(profile.exam_type),
      examLevel: valueOf(profile.exam_level),
      institution: valueOf(profile.institution),
      areaOfInterest: valueOf(profile.area_of_interest),
      country: valueOf(profile.country),
    });
  }, [profileQuery.data]);

  const set = (key: keyof Editable) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus("idle");
    setSaveError(null);
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (form.phone.trim() && !/^[+0-9][0-9\s()-]{6,}$/.test(form.phone.trim())) {
      next.phone = "Enter a valid phone number.";
    }
    return next;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus("error");
      setSaveError(null);
      return;
    }

    const payload: UpdateProfileInput = {
      phone: nullable(form.phone),
      organization_name: nullable(form.organizationName),
      exam_type: nullable(form.examType),
      exam_level: nullable(form.examLevel),
      institution: nullable(form.institution),
      area_of_interest: nullable(form.areaOfInterest),
      country: nullable(form.country),
    };

    try {
      setStatus("idle");
      setSaveError(null);
      await updateProfile.mutateAsync(payload);
      setStatus("saved");
    } catch (error) {
      setStatus("error");
      setSaveError(describeApiError(error, "Your profile could not be updated."));
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Profile"
        description="Your account details and the information we use to contact you."
      />

      {profileQuery.isLoading ? (
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Loading your profile…</p>
        </section>
      ) : profileQuery.isError || !profileQuery.data ? (
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm font-semibold text-foreground">Profile could not be loaded</p>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
            {describeApiError(profileQuery.error, "Please try again in a moment.")}
          </p>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
          <form onSubmit={onSubmit} noValidate className="border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-bold tracking-tight text-foreground">Personal details</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update the fields below and save your changes.
              </p>
            </div>

            {status === "saved" && (
              <div className="flex items-start gap-2.5 border-b border-border bg-success-soft px-5 py-3.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" strokeWidth={2} />
                <p className="text-sm text-success">Your profile has been updated.</p>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-start gap-2.5 border-b border-border bg-danger-soft px-5 py-3.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" strokeWidth={2} />
                <p className="text-sm text-danger">
                  {saveError ?? "Some details need attention. Review the highlighted fields below."}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
              <Field
                id="name"
                label="Name"
                value={user.displayName}
                readOnly
                disabled
                hint="Your name comes from your account identity."
              />
              <Field
                id="phone"
                label="Phone number"
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                error={errors.phone}
              />
              <Field
                id="organizationName"
                label="Organization name"
                value={form.organizationName}
                onChange={set("organizationName")}
                hint="Optional"
              />
              <Field
                id="institution"
                label="Institution"
                value={form.institution}
                onChange={set("institution")}
                hint="Optional"
              />
              <Field
                id="examType"
                label="Exam type"
                value={form.examType}
                onChange={set("examType")}
                hint="Optional"
              />
              <Field
                id="examLevel"
                label="Exam level"
                value={form.examLevel}
                onChange={set("examLevel")}
                hint="Optional"
              />
              <Field
                id="areaOfInterest"
                label="Area of interest"
                value={form.areaOfInterest}
                onChange={set("areaOfInterest")}
                hint="Optional"
              />
              <Field
                id="country"
                label="Country"
                value={form.country}
                onChange={set("country")}
                hint="Optional"
              />

              <div className="sm:col-span-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" value={user.email} readOnly disabled className="mt-2 h-11" />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Your email address is used to sign in and cannot be changed here.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>

          <aside className="border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-bold tracking-tight text-foreground">Account</h2>
            </div>
            <dl className="px-5 py-5">
              <div>
                <dt className="text-xs text-muted-foreground">Full name</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {user.displayName || "—"}
                </dd>
              </div>
              <div className="mt-4">
                <dt className="text-xs text-muted-foreground">Email address</dt>
                <dd className="mt-1 break-words text-sm font-medium text-foreground">
                  {user.email || "—"}
                </dd>
              </div>
              <div className="mt-4">
                <dt className="text-xs text-muted-foreground">Phone number</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{form.phone || "—"}</dd>
              </div>
              <div className="mt-4">
                <dt className="text-xs text-muted-foreground">Profile type</dt>
                <dd className="mt-1.5">
                  <StatusBadge label={profileTypeLabel} tone="info" />
                </dd>
              </div>
              <div className="mt-4">
                <dt className="text-xs text-muted-foreground">Organization name</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {form.organizationName || "Not provided"}
                </dd>
              </div>
              <div className="mt-4">
                <dt className="text-xs text-muted-foreground">Institution</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {form.institution || "Not provided"}
                </dd>
              </div>
              <div className="mt-4">
                <dt className="text-xs text-muted-foreground">Country</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {form.country || "Not provided"}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      )}
    </AppShell>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  readOnly = false,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange?: (value: string) => void;
  error?: string;
  hint?: string;
  type?: string;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={error ? "mt-2 h-11 border-danger" : "mt-2 h-11"}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
