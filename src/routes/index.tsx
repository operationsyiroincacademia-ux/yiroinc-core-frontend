import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth/auth-context";

import { EXPERIENCE_BASE } from "@/lib/roles/experience-context";

const TITLE = "YiroInc Academia Portal";
const DESC =
  "Secure portal for YiroInc Academia clients: orders, payments, requests and protected files.";

/**
 * Role-based dashboard redirection. The target comes from the authenticated
 * session's profile_type (login / register / GET /auth/me), never the URL.
 */
function IndexRedirect() {
  const { status, experience } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "authenticated" && experience) {
      navigate({ to: EXPERIENCE_BASE[experience], replace: true });
    } else if (status === "unauthenticated") {
      navigate({ to: "/login", replace: true });
    }
  }, [status, experience, navigate]);


  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Loading your portal…</p>
    </main>
  );
}

export const Route = createFileRoute("/")({
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
  component: IndexRedirect,
});
