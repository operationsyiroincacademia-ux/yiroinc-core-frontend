import { createFileRoute } from "@tanstack/react-router";

import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";

type ResetPasswordSearch = {
  key?: string;
  login?: string;
};

const TITLE = "Reset Password | YiroInc Academia Portal";
const DESC = "Set a new password for your YiroInc Academia account.";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search): ResetPasswordSearch => ({
    key: typeof search.key === "string" ? search.key : undefined,
    login: typeof search.login === "string" ? search.login : undefined,
  }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordRoute,
});

function ResetPasswordRoute() {
  const search = Route.useSearch();

  return <ResetPasswordPage login={search.login} resetKey={search.key} />;
}
