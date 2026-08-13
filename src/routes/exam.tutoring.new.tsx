import { createFileRoute } from "@tanstack/react-router";

import { NewTutoringRequestPage } from "@/pages/exam/NewTutoringRequestPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/exam/tutoring/new")({
  head: () => ({
    meta: [
      { title: "New tutoring request | YiroInc Academia Portal" },
      { name: "description", content: "Request a tutoring session by choosing exam type, level, timezone and language." },
      { property: "og:title", content: "New tutoring request | YiroInc Academia Portal" },
      { property: "og:description", content: "Request a tutoring session by choosing exam type, level, timezone and language." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("exam", NewTutoringRequestPage),
});
