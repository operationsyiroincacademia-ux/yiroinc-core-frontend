import { createFileRoute } from "@tanstack/react-router";

import { ProductDetailsPage } from "@/pages/commerce/ProductDetailsPage";
import { withExperience } from "@/pages/role-page";

const TITLE = "Service Details | YiroInc Academia Portal";
const DESC =
  "Review a service's description, price and delivery details before placing an order.";

export const Route = createFileRoute("/exam/services/$productId")({
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
  component: withExperience("exam", ProductDetailsPage),
});
