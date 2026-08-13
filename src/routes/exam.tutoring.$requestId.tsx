import { createFileRoute } from "@tanstack/react-router";

import { TutoringRequestDetailsPage } from "@/pages/exam/TutoringRequestDetailsPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/exam/tutoring/$requestId")({
  head: () => ({
    meta: [
      { title: "Tutoring request details | YiroInc Academia Portal" },
      { name: "description", content: "Summary, progress timeline and assigned tutor for a tutoring request." },
      { property: "og:title", content: "Tutoring request details | YiroInc Academia Portal" },
      { property: "og:description", content: "Summary, progress timeline and assigned tutor for a tutoring request." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("exam", TutoringRequestDetailsPage),
});
