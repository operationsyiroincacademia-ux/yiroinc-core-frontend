import { createFileRoute } from "@tanstack/react-router";

import { NotificationsPage } from "@/pages/academic/NotificationsPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/corporate/notifications/")({
  head: () => ({
    meta: [
      { title: "Corporate Notifications | YiroInc Academia Portal" },
      { name: "description", content: "Corporate User: Order, payment and resource updates for your account, with read and dismiss controls." },
      { property: "og:title", content: "Corporate Notifications | YiroInc Academia Portal" },
      { property: "og:description", content: "Corporate User: Order, payment and resource updates for your account, with read and dismiss controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("corporate", NotificationsPage),
});
