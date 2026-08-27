import { createFileRoute } from "@tanstack/react-router";

import { LegalPlaceholderPage } from "@/pages/auth/LegalPlaceholderPage";

const TITLE = "Privacy Policy | YiroInc Academia Portal";
const DESC = "Placeholder Privacy Policy page for YiroInc Academia.";

export const Route = createFileRoute("/privacy-policy")({
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
      title="Privacy Policy"
      message="The full YiroInc Academia Privacy Policy will be published here."
    />
  ),
});
