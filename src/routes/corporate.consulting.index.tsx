import { createFileRoute } from "@tanstack/react-router";

import { ConsultingRequestsPage } from "@/pages/corporate/ConsultingRequestsPage";
import { withExperience } from "@/pages/role-page";

const TITLE = "Corporate Consulting Requests | YiroInc Academia Portal";
const DESC =
  "Corporate User: Track advisory and workshop consulting requests submitted by your organisation and their current status.";

export const Route = createFileRoute("/corporate/consulting/")({
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
  component: withExperience("corporate", ConsultingRequestsPage),
});
