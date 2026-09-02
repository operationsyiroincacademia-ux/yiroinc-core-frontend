import { createFileRoute, redirect } from "@tanstack/react-router";

const TERMS_OF_USE_URL = "https://yiroincacademia.com/terms/";

export const Route = createFileRoute("/terms-of-service")({
  beforeLoad: () => {
    throw redirect({ href: TERMS_OF_USE_URL });
  },
});
