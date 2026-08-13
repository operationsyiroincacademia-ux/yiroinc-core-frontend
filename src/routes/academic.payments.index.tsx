import { createFileRoute } from "@tanstack/react-router";

import { PaymentsListPage } from "@/pages/academic/PaymentsListPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/academic/payments/")({
  head: () => ({
    meta: [
      { title: "Academic Payments | YiroInc Academia Portal" },
      { name: "description", content: "Academic: Track every payment submitted for your orders, including verification status and proof of payment." },
      { property: "og:title", content: "Academic Payments | YiroInc Academia Portal" },
      { property: "og:description", content: "Academic: Track every payment submitted for your orders, including verification status and proof of payment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("academic", PaymentsListPage),
});
