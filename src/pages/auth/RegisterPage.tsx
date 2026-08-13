import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { AuthLayout, Field, inputClass } from "./AuthLayout";
import { Button } from "@/components/ui/button";
import { describeApiError } from "@/features/commerce/api";
import { useAuth } from "@/lib/auth/auth-context";
import {
  PROFILE_TYPE_LABEL,
  PROFILE_TYPE_TO_EXPERIENCE,
  type ProfileType,
} from "@/lib/roles";
import { EXPERIENCE_BASE } from "@/lib/roles/experience-context";

/**
 * Account Type is a UI grouping field only. The request always carries one
 * exact backend profile_type value.
 */
type AccountType = "academic" | "exam" | "corporate";

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "academic", label: "Academic User" },
  { value: "exam", label: "Exam Candidate" },
  { value: "corporate", label: "Corporate User" },
];

const SECONDARY: Record<
  AccountType,
  { label: string; options: ProfileType[] } | null
> = {
  academic: null,
  exam: {
    label: "Exam Type",
    options: ["exam_candidate", "cfa_candidate", "frm_candidate"],
  },
  // Corporate signup always registers as corporate_client. consulting_lead is
  // an internal CRM classification and is never publicly selectable.
  corporate: null,
};

const DEFAULT_PROFILE_TYPE: Record<AccountType, ProfileType> = {
  academic: "academic_user",
  exam: "exam_candidate",
  corporate: "corporate_client",
};

const SECONDARY_LABEL: Partial<Record<ProfileType, string>> = {
  exam_candidate: "General Exam Candidate",
};

export function RegisterPage() {
  const { status, experience, signUp } = useAuth();
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<AccountType>("academic");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    profile_type: "academic_user" as ProfileType,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && experience) {
      navigate({ to: EXPERIENCE_BASE[experience], replace: true });
    }
  }, [status, experience, navigate]);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const secondary = SECONDARY[accountType];

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
    setSubmitting(true);
    try {
      const profile = await signUp(form);
      const target = PROFILE_TYPE_TO_EXPERIENCE[profile.profile_type] ?? "academic";
      navigate({ to: EXPERIENCE_BASE[target], replace: true });
    } catch (err) {
      setError(
        describeApiError(err, "Registration failed. Check your details and try again."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Register to place orders, track requests and manage payments."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
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

        <Field label="Password">
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => set("password")(e.target.value)}
            className={inputClass}
            placeholder="At least 8 characters"
          />
        </Field>

        <Field label="Account type">
          <select
            required
            value={accountType}
            onChange={(e) => changeAccountType(e.target.value as AccountType)}
            className={inputClass}
          >
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
                  {SECONDARY_LABEL[type] ?? PROFILE_TYPE_LABEL[type]}
                </option>
              ))}
            </select>
          </Field>
        )}

        {error && (
          <p className="bg-danger-soft px-3 py-2.5 text-xs text-danger">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
