import { createFileRoute } from "@tanstack/react-router";

import { NewSupportTicketPage } from "@/pages/support/NewSupportTicketPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/exam/support/new")({
  head: () => ({
    meta: [
      { title: "Contact Exam Candidate Support | YiroInc Academia Portal" },
      {
        name: "description",
        content: "Exam Candidate: Send a support request to the YiroInc Academia team.",
      },
      { property: "og:title", content: "Contact Exam Candidate Support | YiroInc Academia Portal" },
      {
        property: "og:description",
        content: "Exam Candidate: Send a support request to the YiroInc Academia team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("exam", NewSupportTicketPage),
});
