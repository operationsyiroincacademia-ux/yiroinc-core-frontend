import { createFileRoute } from "@tanstack/react-router";

import { CorporateDashboardPage } from "@/pages/corporate/CorporateDashboardPage";
import { withExperience } from "@/pages/role-page";

const TITLE = "Corporate Dashboard | YiroInc Academia Portal";
const DESC =
  "Track corporate orders, payments, consulting engagements, procurement requests and shared resources in one place.";

export const Route = createFileRoute("/corporate/")({
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
  component: withExperience("corporate", CorporateDashboardPage),
});
