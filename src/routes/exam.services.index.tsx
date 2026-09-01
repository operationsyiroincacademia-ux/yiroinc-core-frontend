import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/exam/services/")({
  beforeLoad: () => {
    throw redirect({ to: "/exam/store" });
  },
});
