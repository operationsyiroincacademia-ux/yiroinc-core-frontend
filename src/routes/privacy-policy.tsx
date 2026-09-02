import { createFileRoute, redirect } from "@tanstack/react-router";

const PRIVACY_POLICY_URL = "https://yiroincacademia.com/privacy-policy/";

export const Route = createFileRoute("/privacy-policy")({
  beforeLoad: () => {
    throw redirect({ href: PRIVACY_POLICY_URL });
  },
});
