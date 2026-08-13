import { createFileRoute } from "@tanstack/react-router";

import { ProfilePage } from "@/pages/academic/ProfilePage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/exam/profile/")({
  head: () => ({
    meta: [
      { title: "Exam Candidate Profile | YiroInc Academia Portal" },
      { name: "description", content: "Exam Candidate: View and update your account details: name, contact number and organisation." },
      { property: "og:title", content: "Exam Candidate Profile | YiroInc Academia Portal" },
      { property: "og:description", content: "Exam Candidate: View and update your account details: name, contact number and organisation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("exam", ProfilePage),
});
