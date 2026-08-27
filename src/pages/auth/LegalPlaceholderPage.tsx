import { Link } from "@tanstack/react-router";

import { AuthLayout } from "./AuthLayout";

export function LegalPlaceholderPage({ title, message }: { title: string; message: string }) {
  return (
    <AuthLayout title={title}>
      <div className="space-y-5 text-center">
        <p className="text-sm leading-6 text-muted-foreground">{message}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to="/register"
            className="inline-flex h-11 flex-1 items-center justify-center bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Back to registration
          </Link>
          <Link
            to="/login"
            className="inline-flex h-11 flex-1 items-center justify-center border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
