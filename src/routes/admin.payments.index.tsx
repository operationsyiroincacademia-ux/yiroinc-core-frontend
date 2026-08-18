import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { RequireAdmin } from "@/app/guards/RouteGuards";
import { AdminPaymentsPage } from "@/pages/admin/AdminPaymentsPage";
import { useAuth } from "@/lib/auth/auth-context";

function AdminPaymentsRoute() {
  const { status, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (status === "authenticated" && !isAdmin) {
      navigate({ to: "/", replace: true });
    }
  }, [status, isAdmin, navigate]);

  if (status !== "authenticated" || !isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading your portal...</p>
      </main>
    );
  }

  return (
    <RequireAdmin>
      <AdminPaymentsPage />
    </RequireAdmin>
  );
}

export const Route = createFileRoute("/admin/payments/")({
  head: () => ({
    meta: [
      { title: "Admin Payments | YiroInc Academia Portal" },
      {
        name: "description",
        content: "Review and manage payments submitted by YiroInc Academia users.",
      },
      { property: "og:title", content: "Admin Payments | YiroInc Academia Portal" },
      {
        property: "og:description",
        content: "Review and manage payments submitted by YiroInc Academia users.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPaymentsRoute,
});
