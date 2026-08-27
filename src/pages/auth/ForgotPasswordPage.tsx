import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

import { AuthLayout, Field, inputClass } from "./AuthLayout";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/button-loading";
import { requestPasswordReset } from "@/features/auth/api";
import { describeApiError } from "@/lib/api/errors";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const nextEmail = email.trim();
    setEmailError(null);
    setError(null);
    if (!nextEmail) {
      setEmailError("Email address is required.");
      return;
    }
    if (!EMAIL_PATTERN.test(nextEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setPending(true);
    try {
      await requestPasswordReset({ email: nextEmail });
      setSent(true);
    } catch (err) {
      setError(describeApiError(err, "Password reset link could not be sent. Please try again."));
    } finally {
      setPending(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email">
        <div className="space-y-5 text-center">
          <p className="text-sm leading-6 text-muted-foreground">
            If an account exists for that email, we've sent a password reset link.
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            Check your inbox and spam folder.
          </p>
          <Button asChild className="w-full">
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot your password?">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <p className="text-center text-sm leading-6 text-muted-foreground">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <Field label="Email address">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailError(null);
            }}
            className={inputClass}
            placeholder="you@example.com"
          />
        </Field>
        {emailError ? <p className="text-xs font-medium text-danger">{emailError}</p> : null}

        {error ? (
          <p role="alert" className="bg-danger-soft px-3 py-2.5 text-xs text-danger">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
          {pending ? <ButtonLoading>Sending...</ButtonLoading> : "Send reset link"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
