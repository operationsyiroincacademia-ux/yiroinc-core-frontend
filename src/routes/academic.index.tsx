import { createFileRoute } from "@tanstack/react-router";

import { AcademicDashboardPage } from "@/pages/academic/AcademicDashboardPage";
import { withExperience } from "@/pages/role-page";

const TITLE = "Academic Dashboard | YiroInc Academia Portal";
const DESC =
  "Your academic dashboard: track orders, payments, service requests and files in one place.";

export const Route = createFileRoute("/academic/")({
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
  component: withExperience("academic", AcademicDashboardPage),
});
