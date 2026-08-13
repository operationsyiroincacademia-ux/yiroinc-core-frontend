import { createFileRoute } from "@tanstack/react-router";

import { LoginPage } from "@/pages/auth/LoginPage";

const TITLE = "Sign In | YiroInc Academia Portal";
const DESC =
  "Sign in to the YiroInc Academia Portal to manage orders, payments and service requests.";

export const Route = createFileRoute("/login")({
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
  component: LoginPage,
});
