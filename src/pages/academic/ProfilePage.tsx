import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { PROFILE } from "@/features/profile/preview-data";
import { EXPERIENCE_LABEL, PROFILE_TYPE_LABEL } from "@/lib/roles";
import { useCurrentUser } from "@/lib/auth/current-user";

type Editable = {
  firstName: string;
  lastName: string;
  phone: string;
  organisation: string;
};

type Errors = Partial<Record<keyof Editable, string>>;

/**
 * Preview data today. At integration time the record is read from the Profile
 * API and saved with an authenticated update request. Email and profile type
 * are account-level values shown read-only — no account features beyond the
 * documented profile fields are offered here.
 */
export function ProfilePage() {
  const [form, setForm] = useState<Editable>({
    firstName: PROFILE.firstName,
    lastName: PROFILE.lastName,
    phone: PROFILE.phone,
    organisation: PROFILE.organisation,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  // Profile type comes from the active account context, not from the page.
  const user = useCurrentUser();
  const profileTypeLabel = user.profileType
    ? PROFILE_TYPE_LABEL[user.profileType]
    : EXPERIENCE_LABEL[user.experience];

  const set = (key: keyof Editable) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus("idle");
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!form.firstName.trim()) next.firstName = "First name is required.";
    if (!form.lastName.trim()) next.lastName = "Last name is required.";
    if (!form.phone.trim()) {
      next.phone = "Phone number is required.";
    } else if (!/^[+0-9][0-9\s()-]{6,}$/.test(form.phone.trim())) {
      next.phone = "Enter a valid phone number.";
    }
    return next;
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus("error");
      return;
    }
    setStatus("saving");
    // Visual stage only — replaced by the Profile API update request.
    window.setTimeout(() => setStatus("saved"), 500);
  };

  return (
    <AppShell>
      <PageHeader
        title="Profile"
        description="Your account details and the information we use to contact you."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <form onSubmit={onSubmit} noValidate className="border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              Personal details
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update the fields below and save your changes.
            </p>
          </div>

          {status === "saved" && (
            <div className="flex items-start gap-2.5 border-b border-border bg-success-soft px-5 py-3.5">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-success"
                strokeWidth={2}
              />
              <p className="text-sm text-success">
                Your profile has been updated.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-start gap-2.5 border-b border-border bg-danger-soft px-5 py-3.5">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-danger"
                strokeWidth={2}
              />
              <p className="text-sm text-danger">
                Some details need attention. Review the highlighted fields below.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
            <Field
              id="firstName"
              label="First name"
              value={form.firstName}
              onChange={set("firstName")}
              error={errors.firstName}
            />
            <Field
              id="lastName"
              label="Last name"
              value={form.lastName}
              onChange={set("lastName")}
              error={errors.lastName}
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
              id="organisation"
              label="Organisation or institution"
              value={form.organisation}
              onChange={set("organisation")}
              hint="Optional"
            />

            <div className="sm:col-span-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                value={PROFILE.email}
                readOnly
                disabled
                className="mt-2 h-11"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Your email address is used to sign in and cannot be changed here.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
            <Button type="submit" disabled={status === "saving"}>
              {status === "saving" ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>

        <aside className="border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              Account
            </h2>
          </div>
          <dl className="px-5 py-5">
            <div>
              <dt className="text-xs text-muted-foreground">Full name</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {`${form.firstName} ${form.lastName}`.trim() || "—"}
              </dd>
            </div>
            <div className="mt-4">
              <dt className="text-xs text-muted-foreground">Email address</dt>
              <dd className="mt-1 break-words text-sm font-medium text-foreground">
                {PROFILE.email}
              </dd>
            </div>
            <div className="mt-4">
              <dt className="text-xs text-muted-foreground">Phone number</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {form.phone || "—"}
              </dd>
            </div>
            <div className="mt-4">
              <dt className="text-xs text-muted-foreground">Profile type</dt>
              <dd className="mt-1.5">
                <StatusBadge label={profileTypeLabel} tone="info" />
              </dd>
            </div>
            <div className="mt-4">
              <dt className="text-xs text-muted-foreground">
                Organisation or institution
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {form.organisation || "Not provided"}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
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
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  type?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={
          error ? "mt-2 h-11 border-danger" : "mt-2 h-11"
        }
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
