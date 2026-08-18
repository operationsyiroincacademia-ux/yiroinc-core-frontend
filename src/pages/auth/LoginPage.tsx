import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { AuthLayout, Field, inputClass } from "./AuthLayout";
import { Button } from "@/components/ui/button";
import { describeApiError } from "@/features/commerce/api";
import { useAuth } from "@/lib/auth/auth-context";
import { EXPERIENCE_BASE } from "@/lib/roles/experience-context";

export function LoginPage() {
  const { status, experience, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // An already-authenticated user never sees the login form.
  useEffect(() => {
    if (status === "authenticated" && experience) {
      navigate({ to: EXPERIENCE_BASE[experience], replace: true });
    }
  }, [status, experience, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const session = await signIn({ email, password });
      navigate({ to: EXPERIENCE_BASE[session.experience], replace: true });
    } catch (err) {
      setError(describeApiError(err, "Sign in failed. Check your details and try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      description="Access your YiroInc Academia portal."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email address">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </Field>

        {error && <p className="bg-danger-soft px-3 py-2.5 text-xs text-danger">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
