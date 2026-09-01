import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/academic/services/$productId")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/academic/store/$productId", params });
  },
});
