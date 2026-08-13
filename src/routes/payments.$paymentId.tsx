import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/payments/$paymentId")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/academic/payments/$paymentId", params });
  },
});
