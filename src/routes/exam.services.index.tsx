import { createFileRoute } from "@tanstack/react-router";

import { StorePage } from "@/pages/commerce/StorePage";
import { withExperience } from "@/pages/role-page";

const TITLE = "Exam Services & Store | YiroInc Academia Portal";
const DESC =
  "Browse exam preparation services, open an item and place an order paid by manual bank transfer.";

export const Route = createFileRoute("/exam/services/")({
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
  component: withExperience("exam", StorePage),
});
