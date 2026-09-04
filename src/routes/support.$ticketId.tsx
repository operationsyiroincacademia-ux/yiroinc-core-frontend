import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/support/$ticketId")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/academic/support/$ticketId",
      params: { ticketId: params.ticketId },
    });
  },
});
