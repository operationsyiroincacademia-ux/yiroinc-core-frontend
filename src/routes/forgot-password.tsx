import { createFileRoute } from "@tanstack/react-router";

import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";

const TITLE = "Forgot Password | YiroInc Academia Portal";
const DESC = "Request a password reset link for your YiroInc Academia account.";

export const Route = createFileRoute("/forgot-password")({
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
  component: ForgotPasswordPage,
});
