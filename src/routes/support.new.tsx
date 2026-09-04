import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/support/new")({
  beforeLoad: () => {
    throw redirect({ to: "/academic/support/new" });
  },
});
