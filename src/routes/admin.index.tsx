import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { RequireAdmin } from "@/app/guards/RouteGuards";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { useAuth } from "@/lib/auth/auth-context";

const TITLE = "Admin Dashboard | YiroInc Academia Portal";
const DESC = "Administrator workspace for YiroInc Academia operations.";

function AdminIndexRoute() {
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
        <p className="text-sm text-muted-foreground">Loading your portal…</p>
      </main>
    );
  }

  return (
    <RequireAdmin>
      <AdminDashboardPage />
    </RequireAdmin>
  );
}

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminIndexRoute,
});
