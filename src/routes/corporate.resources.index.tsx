import { createFileRoute } from "@tanstack/react-router";

import { ResourcesPage } from "@/pages/academic/ResourcesPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/corporate/resources/")({
  head: () => ({
    meta: [
      { title: "Corporate Resources | YiroInc Academia Portal" },
      { name: "description", content: "Corporate User: Guides, templates, recorded sessions and policy documents available to you." },
      { property: "og:title", content: "Corporate Resources | YiroInc Academia Portal" },
      { property: "og:description", content: "Corporate User: Guides, templates, recorded sessions and policy documents available to you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("corporate", ResourcesPage),
});
