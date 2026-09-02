import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { AuthDivider, GoogleAccountSetupForm, GoogleAuth, type GoogleSetup } from "./GoogleAuth";
import { AuthLayout, Field, inputClass, PasswordInput } from "./AuthLayout";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/button-loading";
import type { GoogleCustomerProfileType } from "@/features/auth/api";
import { describeApiError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/auth-context";
import {
  PROFILE_TYPE_LABEL,
  PROFILE_TYPE_TO_EXPERIENCE,
  type Experience,
  type ProfileType,
} from "@/lib/roles";
import { EXPERIENCE_BASE } from "@/lib/roles/experience-context";

/**
 * Account Type is a UI grouping field only. The request always carries one
 * exact backend profile_type value.
 */
type AccountType = "academic" | "exam" | "corporate";
type AccountTypeSelection = AccountType | "";

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "academic", label: "Academic User" },
  { value: "exam", label: "Exam Candidate" },
  { value: "corporate", label: "Corporate User" },
];

const SECONDARY: Record<AccountType, { label: string; options: ProfileType[] } | null> = {
  academic: null,
  exam: {
    label: "Exam Type",
    options: ["cfa_candidate", "frm_candidate"],
  },
  // Corporate signup always registers as corporate_client. consulting_lead is
  // an internal CRM classification and is never publicly selectable.
  corporate: null,
};

const DEFAULT_PROFILE_TYPE: Record<AccountType, ProfileType> = {
  academic: "academic_user",
  exam: "cfa_candidate",
  corporate: "corporate_client",
};

type GoogleSignupStep =
  | { status: "register" }
  | { status: "setup"; setup: GoogleSetup }
  | {
      status: "ready";
      experience: Experience;
      profileType: GoogleCustomerProfileType;
    };

function readyCopy(profileType: GoogleCustomerProfileType): string {
  if (profileType === "corporate_client") {
    return "Your account is ready. You can now submit consulting or procurement requests and track them from your dashboard.";
  }
  if (profileType === "cfa_candidate" || profileType === "frm_candidate") {
    return "Your account is ready. Access exam resources, request tutoring, and manage your learning from your dashboard.";
  }
  return "Your account is ready. Access academic resources, manage your profile, and explore available services.";
}

export function RegisterPage() {
  const { status, experience, signUp } = useAuth();
  const navigate = useNavigate();
  const [googleStep, setGoogleStep] = useState<GoogleSignupStep>({ status: "register" });
  const [accountType, setAccountType] = useState<AccountTypeSelection>("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    profile_type: "academic_user" as ProfileType,
    organization_name: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (googleStep.status === "register" && status === "authenticated" && experience) {
      navigate({ to: EXPERIENCE_BASE[experience], replace: true });
    }
  }, [googleStep.status, status, experience, navigate]);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const secondary = accountType ? SECONDARY[accountType] : null;

  /** Changing the grouping resets any stale secondary selection. */
  const changeAccountType = (next: AccountType) => {
    setAccountType(next);
    const group = SECONDARY[next];
    setForm((prev) => ({
      ...prev,
      profile_type: group ? group.options[0] : DEFAULT_PROFILE_TYPE[next],
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    if (!accountType) {
      setError("Choose an account type before creating your account.");
      return;
    }
    const organizationName = form.organization_name.trim();
    if (form.profile_type === "corporate_client" && organizationName.length === 0) {
      setError("Organization name is required for Corporate accounts.");
      return;
    }
    if (form.profile_type === "corporate_client" && organizationName.length > 255) {
      setError("Organization name must be 255 characters or fewer.");
      return;
    }
    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      password: form.password,
      profile_type: form.profile_type,
      ...(form.profile_type === "corporate_client" ? { organization_name: organizationName } : {}),
    };
    setSubmitting(true);
    try {
      const profile = await signUp(payload);
      const target = PROFILE_TYPE_TO_EXPERIENCE[profile.profile_type] ?? "academic";
      navigate({ to: EXPERIENCE_BASE[target], replace: true });
    } catch (err) {
      setError(describeApiError(err, "Registration failed. Check your details and try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (googleStep.status === "setup") {
    return (
      <AuthLayout title="Finish account setup">
        <GoogleAccountSetupForm
          setup={googleStep.setup}
          onComplete={({ experience: nextExperience, profileType }) => {
            setGoogleStep({
              status: "ready",
              experience: nextExperience,
              profileType,
            });
          }}
          onUseDifferentAccount={() => setGoogleStep({ status: "register" })}
        />
      </AuthLayout>
    );
  }

  if (googleStep.status === "ready") {
    return (
      <AuthLayout title="You're all set">
        <div className="space-y-5 text-center">
          <p className="text-sm leading-6 text-muted-foreground">
            {readyCopy(googleStep.profileType)}
          </p>
          <Button
            type="button"
            className="w-full"
            onClick={() => navigate({ to: EXPERIENCE_BASE[googleStep.experience], replace: true })}
          >
            Go to dashboard
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account">
      <div className="space-y-5">
        <GoogleAuth
          text="signup_with"
          onAuthenticated={(nextExperience) =>
            navigate({ to: EXPERIENCE_BASE[nextExperience], replace: true })
          }
          onSetupRequired={(setup) => setGoogleStep({ status: "setup", setup })}
        />
        <AuthDivider />

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name">
              <input
                required
                autoComplete="given-name"
                value={form.first_name}
                onChange={(e) => set("first_name")(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Last name">
              <input
                required
                autoComplete="family-name"
                value={form.last_name}
                onChange={(e) => set("last_name")(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Email address">
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => set("email")(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </Field>

          <PasswordInput
            value={form.password}
            onChange={(event) => set("password")(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            placeholder="At least 8 characters"
          />

          <Field label="Account type">
            <select
              required
              value={accountType}
              onChange={(e) => changeAccountType(e.target.value as AccountType)}
              className={inputClass}
            >
              <option value="" disabled>
                Choose an account type
              </option>
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </Field>

          {secondary && (
            <Field label={secondary.label}>
              <select
                required
                value={form.profile_type}
                onChange={(e) => set("profile_type")(e.target.value)}
                className={inputClass}
              >
                {secondary.options.map((type) => (
                  <option key={type} value={type}>
                    {PROFILE_TYPE_LABEL[type]}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {form.profile_type === "corporate_client" && (
            <Field label="Organization name">
              <input
                required
                maxLength={255}
                autoComplete="organization"
                value={form.organization_name}
                onChange={(e) => set("organization_name")(e.target.value)}
                className={inputClass}
                placeholder="Acme Corporation"
              />
            </Field>
          )}

          {error && (
            <p role="alert" className="bg-danger-soft px-3 py-2.5 text-xs text-danger">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting} aria-busy={submitting}>
            {submitting ? <ButtonLoading>Creating account...</ButtonLoading> : "Create account"}
          </Button>
        </form>

        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            By creating a YiroInc Academia account, you agree to our{" "}
            <a
              href="https://yiroincacademia.com/privacy-policy/"
              className="font-semibold text-primary hover:underline"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="https://yiroincacademia.com/terms/"
              className="font-semibold text-primary hover:underline"
            >
              Terms of Service
            </a>
            .
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
