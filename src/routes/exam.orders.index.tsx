import { createFileRoute } from "@tanstack/react-router";

import { OrdersListPage } from "@/pages/academic/OrdersListPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/exam/orders/")({
  head: () => ({
    meta: [
      { title: "Exam Candidate Orders | YiroInc Academia Portal" },
      { name: "description", content: "Exam Candidate: Review every order placed with YiroInc Academia, track its status and follow up on outstanding payments." },
      { property: "og:title", content: "Exam Candidate Orders | YiroInc Academia Portal" },
      { property: "og:description", content: "Exam Candidate: Review every order placed with YiroInc Academia, track its status and follow up on outstanding payments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("exam", OrdersListPage),
});
