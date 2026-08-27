import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { AuthDivider, GoogleAuth } from "./GoogleAuth";
import { AuthLayout, Field, inputClass, PasswordInput } from "./AuthLayout";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/button-loading";
import { describeApiError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/auth-context";
import { EXPERIENCE_BASE } from "@/lib/roles/experience-context";

export function LoginPage() {
  const { status, experience, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
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
      const session = await signIn({ email, password }, { remember });
      navigate({ to: EXPERIENCE_BASE[session.experience], replace: true });
    } catch (err) {
      setError(describeApiError(err, "Sign in failed. Check your details and try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" titleScale="login">
      <div className="space-y-5">
        <GoogleAuth
          remember={remember}
          text="signin_with"
          onAuthenticated={(nextExperience) =>
            navigate({ to: EXPERIENCE_BASE[nextExperience], replace: true })
          }
        />
        <AuthDivider />

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

          <PasswordInput
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
          />

          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 border-border accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            Remember me
          </label>

          {error && (
            <p role="alert" className="bg-danger-soft px-3 py-2.5 text-xs text-danger">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting} aria-busy={submitting}>
            {submitting ? <ButtonLoading>Signing in...</ButtonLoading> : "Sign in"}
          </Button>
        </form>

        <div className="space-y-4 text-center">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Forgot password?
          </Link>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
