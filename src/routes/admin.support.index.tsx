import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { RequireAdmin } from "@/app/guards/RouteGuards";
import { FullPageLoading } from "@/components/shared/LoadingState";
import { useAuth } from "@/lib/auth/auth-context";
import { AdminSupportPage } from "@/pages/admin/AdminSupportPage";

function AdminSupportRoute() {
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
      <AdminSupportPage />
    </RequireAdmin>
  );
}

export const Route = createFileRoute("/admin/support/")({
  head: () => ({
    meta: [
      { title: "Admin Support | YiroInc Academia Portal" },
      {
        name: "description",
        content: "Review and respond to customer support tickets.",
      },
      { property: "og:title", content: "Admin Support | YiroInc Academia Portal" },
      {
        property: "og:description",
        content: "Review and respond to customer support tickets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminSupportRoute,
});
