import type { ReactNode } from "react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";

/**
 * Admin area layout. It intentionally reuses the same shell, spacing and
 * design system as the user experience; admin-specific components live in
 * src/components/admin.
 */
export function AdminLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

export { PageHeader };
