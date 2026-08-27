import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

import { AuthLayout, PasswordInput } from "./AuthLayout";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/button-loading";
import { resetPassword } from "@/features/auth/api";
import { ApiError } from "@/lib/api/client";
import { describeApiError } from "@/lib/api/errors";

type ResetPasswordPageProps = {
  login?: string;
  resetKey?: string;
};

type FormErrors = {
  password?: string;
  confirmPassword?: string;
};

function InvalidResetLink() {
  return (
    <AuthLayout title="Reset password">
      <div className="space-y-5 text-center">
        <p className="text-sm leading-6 text-muted-foreground">
          This password reset link is invalid or incomplete.
        </p>
        <Button asChild className="w-full">
          <Link to="/forgot-password">Request a new reset link</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}

function ExpiredResetLink() {
  return (
    <AuthLayout title="Reset password">
      <div className="space-y-5 text-center">
        <p className="text-sm leading-6 text-muted-foreground">
          This password reset link is invalid or has expired.
        </p>
        <Button asChild className="w-full">
          <Link to="/forgot-password">Request a new reset link</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}

export function ResetPasswordPage({ login, resetKey }: ResetPasswordPageProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [complete, setComplete] = useState(false);
  const [pending, setPending] = useState(false);

  if (!login || !resetKey) return <InvalidResetLink />;
  if (invalid) return <ExpiredResetLink />;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const nextErrors: FormErrors = {};
    setError(null);
    if (!password) nextErrors.password = "New password is required.";
    if (password && password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (!confirmPassword) nextErrors.confirmPassword = "Confirm your new password.";
    if (confirmPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    try {
      await resetPassword({ login, key: resetKey, password });
      setPassword("");
      setConfirmPassword("");
      setComplete(true);
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.status === 400 || err.status === 401 || err.status === 403 || err.status === 404)
      ) {
        setInvalid(true);
      } else {
        setError(describeApiError(err, "Password could not be reset. Please try again."));
      }
    } finally {
      setPending(false);
    }
  };

  if (complete) {
    return (
      <AuthLayout title="Password reset">
        <div className="space-y-5 text-center">
          <p className="text-sm leading-6 text-muted-foreground">
            Your password has been updated successfully.
          </p>
          <Button asChild className="w-full">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset password">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <PasswordInput
          label="New password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((current) => ({ ...current, password: undefined }));
          }}
          autoComplete="new-password"
          minLength={8}
          placeholder="At least 8 characters"
        />
        {errors.password ? (
          <p className="text-xs font-medium text-danger">{errors.password}</p>
        ) : null}

        <PasswordInput
          label="Confirm new password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setErrors((current) => ({ ...current, confirmPassword: undefined }));
          }}
          autoComplete="new-password"
          minLength={8}
          placeholder="Confirm your new password"
        />
        {errors.confirmPassword ? (
          <p className="text-xs font-medium text-danger">{errors.confirmPassword}</p>
        ) : null}

        {error ? (
          <p role="alert" className="bg-danger-soft px-3 py-2.5 text-xs text-danger">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
          {pending ? <ButtonLoading>Resetting...</ButtonLoading> : "Reset password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
