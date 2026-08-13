import { createFileRoute } from "@tanstack/react-router";

import { PaymentDetailsPage } from "@/pages/academic/PaymentDetailsPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/corporate/payments/$paymentId")({
  head: () => ({
    meta: [
      { title: "Corporate Payment details | YiroInc Academia Portal" },
      { name: "description", content: "Corporate User: Amount paid, related order, verification status, proof of payment and activity history." },
      { property: "og:title", content: "Corporate Payment details | YiroInc Academia Portal" },
      { property: "og:description", content: "Corporate User: Amount paid, related order, verification status, proof of payment and activity history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("corporate", PaymentDetailsPage),
});
