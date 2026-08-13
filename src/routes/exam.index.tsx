import { createFileRoute } from "@tanstack/react-router";

import { ExamDashboardPage } from "@/pages/exam/ExamDashboardPage";
import { withExperience } from "@/pages/role-page";

const TITLE = "Exam Candidate Dashboard | YiroInc Academia Portal";
const DESC =
  "Track exam preparation orders, payments, tutoring requests and study resources in one place.";

export const Route = createFileRoute("/exam/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("exam", ExamDashboardPage),
});
