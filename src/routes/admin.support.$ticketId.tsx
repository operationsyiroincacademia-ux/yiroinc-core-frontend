import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { RequireAdmin } from "@/app/guards/RouteGuards";
import { FullPageLoading } from "@/components/shared/LoadingState";
import { useAuth } from "@/lib/auth/auth-context";
import { AdminSupportTicketDetailsPage } from "@/pages/admin/AdminSupportTicketDetailsPage";

function AdminSupportTicketRoute() {
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
      <AdminSupportTicketDetailsPage />
    </RequireAdmin>
  );
}

export const Route = createFileRoute("/admin/support/$ticketId")({
  head: () => ({
    meta: [
      { title: "Admin Support Ticket | YiroInc Academia Portal" },
      {
        name: "description",
        content: "Review a customer support conversation and respond as support.",
      },
      { property: "og:title", content: "Admin Support Ticket | YiroInc Academia Portal" },
      {
        property: "og:description",
        content: "Review a customer support conversation and respond as support.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminSupportTicketRoute,
});
