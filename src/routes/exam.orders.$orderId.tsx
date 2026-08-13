import { createFileRoute } from "@tanstack/react-router";

import { OrderDetailsPage } from "@/pages/academic/OrderDetailsPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/exam/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Exam Candidate Order details | YiroInc Academia Portal" },
      { name: "description", content: "Exam Candidate: Service summary, payment records, attached files and status history for a single order." },
      { property: "og:title", content: "Exam Candidate Order details | YiroInc Academia Portal" },
      { property: "og:description", content: "Exam Candidate: Service summary, payment records, attached files and status history for a single order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("exam", OrderDetailsPage),
});
