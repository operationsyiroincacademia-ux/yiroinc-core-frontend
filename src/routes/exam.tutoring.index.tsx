import { createFileRoute } from "@tanstack/react-router";

import { TutoringRequestsPage } from "@/pages/exam/TutoringRequestsPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/exam/tutoring/")({
  head: () => ({
    meta: [
      { title: "Tutoring Requests | YiroInc Academia Portal" },
      { name: "description", content: "Track every tutoring session you have requested, its mode, requested date and scheduling status." },
      { property: "og:title", content: "Tutoring Requests | YiroInc Academia Portal" },
      { property: "og:description", content: "Track every tutoring session you have requested, its mode, requested date and scheduling status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("exam", TutoringRequestsPage),
});
