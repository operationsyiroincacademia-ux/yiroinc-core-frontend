import { createFileRoute } from "@tanstack/react-router";

import { SupportListPage } from "@/pages/support/SupportListPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/corporate/support/")({
  head: () => ({
    meta: [
      { title: "Corporate Support | YiroInc Academia Portal" },
      {
        name: "description",
        content:
          "Corporate User: Contact YiroInc Academia support and review your support conversations.",
      },
      { property: "og:title", content: "Corporate Support | YiroInc Academia Portal" },
      {
        property: "og:description",
        content:
          "Corporate User: Contact YiroInc Academia support and review your support conversations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("corporate", SupportListPage),
});
