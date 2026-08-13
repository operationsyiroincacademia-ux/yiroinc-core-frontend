import { createFileRoute } from "@tanstack/react-router";

import { CheckoutPage } from "@/pages/commerce/CheckoutPage";
import { withExperience } from "@/pages/role-page";

const TITLE = "Payment Instructions | YiroInc Academia Portal";
const DESC =
  "Bank transfer instructions for your order, plus secure proof-of-payment upload.";

export const Route = createFileRoute("/exam/checkout/$orderId")({
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
  component: withExperience("exam", CheckoutPage),
});
