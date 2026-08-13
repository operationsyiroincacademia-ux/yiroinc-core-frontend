import { createFileRoute } from "@tanstack/react-router";

import { ResourcesPage } from "@/pages/academic/ResourcesPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/academic/resources/")({
  head: () => ({
    meta: [
      { title: "Academic Resources | YiroInc Academia Portal" },
      { name: "description", content: "Academic: Guides, templates, recorded sessions and policy documents available to you." },
      { property: "og:title", content: "Academic Resources | YiroInc Academia Portal" },
      { property: "og:description", content: "Academic: Guides, templates, recorded sessions and policy documents available to you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("academic", ResourcesPage),
});
