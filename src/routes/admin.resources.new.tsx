import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { RequireAdmin } from "@/app/guards/RouteGuards";
import { AdminNewResourcePage } from "@/pages/admin/AdminNewResourcePage";
import { useAuth } from "@/lib/auth/auth-context";
import { FullPageLoading } from "@/components/shared/LoadingState";

function RouteComponent() {
  const { status, isAdmin } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (status === "unauthenticated") navigate({ to: "/login", replace: true });
    if (status === "authenticated" && !isAdmin) navigate({ to: "/", replace: true });
  }, [status, isAdmin, navigate]);
  if (status !== "authenticated" || !isAdmin) {
    return <FullPageLoading />;
  }
  return (
    <RequireAdmin>
      <AdminNewResourcePage />
    </RequireAdmin>
  );
}

export const Route = createFileRoute("/admin/resources/new")({
  head: () => ({ meta: [{ title: "New Admin Resource | YiroInc Academia Portal" }] }),
  component: RouteComponent,
});
