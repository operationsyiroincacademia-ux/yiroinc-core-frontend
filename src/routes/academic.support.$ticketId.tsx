import { createFileRoute } from "@tanstack/react-router";

import { SupportTicketDetailsPage } from "@/pages/support/SupportTicketDetailsPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/academic/support/$ticketId")({
  head: () => ({
    meta: [
      { title: "Academic Support request | YiroInc Academia Portal" },
      {
        name: "description",
        content: "Academic: Review and reply to a YiroInc Academia support conversation.",
      },
      { property: "og:title", content: "Academic Support request | YiroInc Academia Portal" },
      {
        property: "og:description",
        content: "Academic: Review and reply to a YiroInc Academia support conversation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("academic", SupportTicketDetailsPage),
});
