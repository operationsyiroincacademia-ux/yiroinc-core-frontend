import { createFileRoute } from "@tanstack/react-router";

import { SupportListPage } from "@/pages/support/SupportListPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/exam/support/")({
  head: () => ({
    meta: [
      { title: "Exam Candidate Support | YiroInc Academia Portal" },
      {
        name: "description",
        content:
          "Exam Candidate: Contact YiroInc Academia support and review your support conversations.",
      },
      { property: "og:title", content: "Exam Candidate Support | YiroInc Academia Portal" },
      {
        property: "og:description",
        content:
          "Exam Candidate: Contact YiroInc Academia support and review your support conversations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("exam", SupportListPage),
});
