import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { RequireAdmin } from "@/app/guards/RouteGuards";
import { AdminTutorDetailsPage } from "@/pages/admin/AdminTutorDetailsPage";
import { useAuth } from "@/lib/auth/auth-context";

function RouteComponent() {
  const { status, isAdmin } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (status === "unauthenticated") navigate({ to: "/login", replace: true });
    if (status === "authenticated" && !isAdmin) navigate({ to: "/", replace: true });
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
      <AdminTutorDetailsPage />
    </RequireAdmin>
  );
}

export const Route = createFileRoute("/admin/tutors/$tutorId")({
  head: () => ({ meta: [{ title: "Admin Tutor | YiroInc Academia Portal" }] }),
  component: RouteComponent,
});
