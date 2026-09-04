import { createFileRoute } from "@tanstack/react-router";

import { SupportTicketDetailsPage } from "@/pages/support/SupportTicketDetailsPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/corporate/support/$ticketId")({
  head: () => ({
    meta: [
      { title: "Corporate Support request | YiroInc Academia Portal" },
      {
        name: "description",
        content: "Corporate User: Review and reply to a YiroInc Academia support conversation.",
      },
      { property: "og:title", content: "Corporate Support request | YiroInc Academia Portal" },
      {
        property: "og:description",
        content: "Corporate User: Review and reply to a YiroInc Academia support conversation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("corporate", SupportTicketDetailsPage),
});
