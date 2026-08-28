import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { RequireAdmin } from "@/app/guards/RouteGuards";
import { useAuth } from "@/lib/auth/auth-context";
import { FullPageLoading } from "@/components/shared/LoadingState";
import { AdminNotificationsPage } from "@/pages/admin/AdminNotificationsPage";

function AdminNotificationsRoute() {
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
      <AdminNotificationsPage />
    </RequireAdmin>
  );
}

export const Route = createFileRoute("/admin/notifications/")({
  head: () => ({
    meta: [
      { title: "Admin Notifications | YiroInc Academia Portal" },
      {
        name: "description",
        content: "View updates and activity that need your attention.",
      },
    ],
  }),
  component: AdminNotificationsRoute,
});
