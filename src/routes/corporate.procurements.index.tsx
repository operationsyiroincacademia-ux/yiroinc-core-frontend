import { createFileRoute } from "@tanstack/react-router";

import { ProcurementRequestsPage } from "@/pages/corporate/ProcurementRequestsPage";
import { withExperience } from "@/pages/role-page";

const TITLE = "Corporate Procurement Requests | YiroInc Academia Portal";
const DESC =
  "Corporate User: Review procurement requests raised for your organisation, including quantities and delivery status.";

export const Route = createFileRoute("/corporate/procurements/")({
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
  component: withExperience("corporate", ProcurementRequestsPage),
});
