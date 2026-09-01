import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/corporate/services/$productId")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/corporate/store/$productId", params });
  },
});
