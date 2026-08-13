import { createFileRoute } from "@tanstack/react-router";

import { ProfilePage } from "@/pages/academic/ProfilePage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/academic/profile/")({
  head: () => ({
    meta: [
      { title: "Academic Profile | YiroInc Academia Portal" },
      { name: "description", content: "Academic: View and update your account details: name, contact number and organisation." },
      { property: "og:title", content: "Academic Profile | YiroInc Academia Portal" },
      { property: "og:description", content: "Academic: View and update your account details: name, contact number and organisation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("academic", ProfilePage),
});
