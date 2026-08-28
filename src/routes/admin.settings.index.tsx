import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { RequireAdmin } from "@/app/guards/RouteGuards";
import { useAuth } from "@/lib/auth/auth-context";
import { FullPageLoading } from "@/components/shared/LoadingState";
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";

function AdminSettingsRoute() {
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
    return <FullPageLoading />;
  }

  return (
    <RequireAdmin>
      <AdminSettingsPage />
    </RequireAdmin>
  );
}

export const Route = createFileRoute("/admin/settings/")({
  head: () => ({
    meta: [
      { title: "Admin Settings | YiroInc Academia Portal" },
      {
        name: "description",
        content: "Manage platform settings and payment information.",
      },
    ],
  }),
  component: AdminSettingsRoute,
});
