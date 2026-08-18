import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { RequireAdmin } from "@/app/guards/RouteGuards";
import { AdminPaymentDetailsPage } from "@/pages/admin/AdminPaymentDetailsPage";
import { useAuth } from "@/lib/auth/auth-context";

function AdminPaymentDetailsRoute() {
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
      <AdminPaymentDetailsPage />
    </RequireAdmin>
  );
}

export const Route = createFileRoute("/admin/payments/$paymentId")({
  head: () => ({
    meta: [
      { title: "Admin Payment Details | YiroInc Academia Portal" },
      {
        name: "description",
        content: "Review payment proof, customer details and verification history.",
      },
      { property: "og:title", content: "Admin Payment Details | YiroInc Academia Portal" },
      {
        property: "og:description",
        content: "Review payment proof, customer details and verification history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPaymentDetailsRoute,
});
