import { createFileRoute } from "@tanstack/react-router";

import { OrdersListPage } from "@/pages/academic/OrdersListPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/corporate/orders/")({
  head: () => ({
    meta: [
      { title: "Corporate Orders | YiroInc Academia Portal" },
      { name: "description", content: "Corporate User: Review every order placed with YiroInc Academia, track its status and follow up on outstanding payments." },
      { property: "og:title", content: "Corporate Orders | YiroInc Academia Portal" },
      { property: "og:description", content: "Corporate User: Review every order placed with YiroInc Academia, track its status and follow up on outstanding payments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("corporate", OrdersListPage),
});
