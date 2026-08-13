import { createFileRoute } from "@tanstack/react-router";

import { OrderDetailsPage } from "@/pages/academic/OrderDetailsPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/corporate/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Corporate Order details | YiroInc Academia Portal" },
      { name: "description", content: "Corporate User: Service summary, payment records, attached files and status history for a single order." },
      { property: "og:title", content: "Corporate Order details | YiroInc Academia Portal" },
      { property: "og:description", content: "Corporate User: Service summary, payment records, attached files and status history for a single order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("corporate", OrderDetailsPage),
});
