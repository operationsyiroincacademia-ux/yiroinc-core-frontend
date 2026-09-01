import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/academic/services/")({
  beforeLoad: () => {
    throw redirect({ to: "/academic/store" });
  },
});
