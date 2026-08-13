import { createFileRoute } from "@tanstack/react-router";

import { ResourcesPage } from "@/pages/academic/ResourcesPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/exam/resources/")({
  head: () => ({
    meta: [
      { title: "Exam Candidate Resources | YiroInc Academia Portal" },
      { name: "description", content: "Exam Candidate: Guides, templates, recorded sessions and policy documents available to you." },
      { property: "og:title", content: "Exam Candidate Resources | YiroInc Academia Portal" },
      { property: "og:description", content: "Exam Candidate: Guides, templates, recorded sessions and policy documents available to you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("exam", ResourcesPage),
});
