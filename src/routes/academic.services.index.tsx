import { createFileRoute } from "@tanstack/react-router";

import { StorePage } from "@/pages/commerce/StorePage";
import { withExperience } from "@/pages/role-page";

const TITLE = "Academic Yiroinc Store | YiroInc Academia Portal";
const DESC =
  "Browse academic services, open an item and place an order paid by manual bank transfer.";

export const Route = createFileRoute("/academic/services/")({
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
  component: withExperience("academic", StorePage),
});
