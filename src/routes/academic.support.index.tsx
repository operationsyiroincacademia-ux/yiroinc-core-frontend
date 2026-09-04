import { createFileRoute } from "@tanstack/react-router";

import { SupportListPage } from "@/pages/support/SupportListPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/academic/support/")({
  head: () => ({
    meta: [
      { title: "Academic Support | YiroInc Academia Portal" },
      {
        name: "description",
        content:
          "Academic: Contact YiroInc Academia support and review your support conversations.",
      },
      { property: "og:title", content: "Academic Support | YiroInc Academia Portal" },
      {
        property: "og:description",
        content:
          "Academic: Contact YiroInc Academia support and review your support conversations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("academic", SupportListPage),
});
