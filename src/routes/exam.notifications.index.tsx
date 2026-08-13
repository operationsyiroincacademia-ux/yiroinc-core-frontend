import { createFileRoute } from "@tanstack/react-router";

import { NotificationsPage } from "@/pages/academic/NotificationsPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/exam/notifications/")({
  head: () => ({
    meta: [
      { title: "Exam Candidate Notifications | YiroInc Academia Portal" },
      { name: "description", content: "Exam Candidate: Order, payment and resource updates for your account, with read and dismiss controls." },
      { property: "og:title", content: "Exam Candidate Notifications | YiroInc Academia Portal" },
      { property: "og:description", content: "Exam Candidate: Order, payment and resource updates for your account, with read and dismiss controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("exam", NotificationsPage),
});
