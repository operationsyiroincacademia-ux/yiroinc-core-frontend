import { createFileRoute } from "@tanstack/react-router";

import { SupportTicketDetailsPage } from "@/pages/support/SupportTicketDetailsPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/exam/support/$ticketId")({
  head: () => ({
    meta: [
      { title: "Exam Candidate Support request | YiroInc Academia Portal" },
      {
        name: "description",
        content: "Exam Candidate: Review and reply to a YiroInc Academia support conversation.",
      },
      { property: "og:title", content: "Exam Candidate Support request | YiroInc Academia Portal" },
      {
        property: "og:description",
        content: "Exam Candidate: Review and reply to a YiroInc Academia support conversation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("exam", SupportTicketDetailsPage),
});
