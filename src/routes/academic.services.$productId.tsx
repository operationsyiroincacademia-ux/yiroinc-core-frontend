import { createFileRoute } from "@tanstack/react-router";

import { ProductDetailsPage } from "@/pages/commerce/ProductDetailsPage";
import { withExperience } from "@/pages/role-page";

const TITLE = "Product Details | YiroInc Academia Portal";
const DESC =
  "Review a Yiroinc Store product's description, price and details before placing an order.";

export const Route = createFileRoute("/academic/services/$productId")({
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
  component: withExperience("academic", ProductDetailsPage),
});
