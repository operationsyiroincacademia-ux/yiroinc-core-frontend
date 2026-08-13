import { createFileRoute } from "@tanstack/react-router";

import { PaymentsListPage } from "@/pages/academic/PaymentsListPage";
import { withExperience } from "@/pages/role-page";

export const Route = createFileRoute("/exam/payments/")({
  head: () => ({
    meta: [
      { title: "Exam Candidate Payments | YiroInc Academia Portal" },
      { name: "description", content: "Exam Candidate: Track every payment submitted for your orders, including verification status and proof of payment." },
      { property: "og:title", content: "Exam Candidate Payments | YiroInc Academia Portal" },
      { property: "og:description", content: "Exam Candidate: Track every payment submitted for your orders, including verification status and proof of payment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withExperience("exam", PaymentsListPage),
});
