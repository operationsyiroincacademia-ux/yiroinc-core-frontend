import { createFileRoute } from "@tanstack/react-router";

import { ProfilePage } from "@/pages/academic/ProfilePage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/corporate/profile/")({
  head: () => ({
    meta: [
      { title: "Corporate Profile | YiroInc Academia Portal" },
      { name: "description", content: "Corporate User: View and update your account details: name, contact number and organisation." },
      { property: "og:title", content: "Corporate Profile | YiroInc Academia Portal" },
      { property: "og:description", content: "Corporate User: View and update your account details: name, contact number and organisation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("corporate", ProfilePage),
});
