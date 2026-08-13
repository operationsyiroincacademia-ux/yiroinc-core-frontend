import { createFileRoute } from "@tanstack/react-router";

import { OrderDetailsPage } from "@/pages/academic/OrderDetailsPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/academic/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Academic Order details | YiroInc Academia Portal" },
      { name: "description", content: "Academic: Service summary, payment records, attached files and status history for a single order." },
      { property: "og:title", content: "Academic Order details | YiroInc Academia Portal" },
      { property: "og:description", content: "Academic: Service summary, payment records, attached files and status history for a single order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("academic", OrderDetailsPage),
});
