import { createFileRoute } from "@tanstack/react-router";

import { RegisterPage } from "@/pages/auth/RegisterPage";

const TITLE = "Create Account | YiroInc Academia Portal";
const DESC =
  "Register for the YiroInc Academia Portal to order services, track requests and upload payment proof.";

export const Route = createFileRoute("/register")({
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
  component: RegisterPage,
});
