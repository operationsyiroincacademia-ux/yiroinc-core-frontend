import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/corporate/services/")({
  beforeLoad: () => {
    throw redirect({ to: "/corporate/store" });
  },
});
