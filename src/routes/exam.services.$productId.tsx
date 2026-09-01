import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/exam/services/$productId")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/exam/store/$productId", params });
  },
});
