import type { ReactNode } from "react";

import { useAuth } from "@/lib/auth/auth-context";
import { useCurrentUser } from "@/lib/auth/current-user";
import type { Experience } from "@/lib/roles";

/**
 * Route guards for the shared authentication system. The session comes from
 * the auth context (login / register / GET /auth/me).
 */

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status !== "authenticated") return null;
  return <>{children}</>;
}

export function RequireExperience({
  allow,
  children,
  fallback = null,
}: {
  allow: Experience[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const user = useCurrentUser();
  if (!allow.includes(user.experience)) return <>{fallback}</>;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  return <RequireExperience allow={["admin"]}>{children}</RequireExperience>;
}
