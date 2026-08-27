import { createFileRoute } from "@tanstack/react-router";

import { LegalPlaceholderPage } from "@/pages/auth/LegalPlaceholderPage";

const TITLE = "Terms of Service | YiroInc Academia Portal";
const DESC = "Placeholder Terms of Service page for YiroInc Academia.";

export const Route = createFileRoute("/terms-of-service")({
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
  component: () => (
    <LegalPlaceholderPage
      title="Terms of Service"
      message="The full YiroInc Academia Terms of Service will be published here."
    />
  ),
});
