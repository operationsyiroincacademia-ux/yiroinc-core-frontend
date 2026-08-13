/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { roleHref, useExperience } from "@/lib/roles/experience-context";

type RoleLinkProps = {
  to: string;
  params?: Record<string, string>;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
};

/**
 * Link that resolves a role-relative path ("/orders") against the active
 * experience ("/exam/orders"). Keeps shared pages free of role branching.
 */
export function RoleLink({ to, ...rest }: RoleLinkProps) {
  const experience = useExperience();
  const LooseLink = Link as any;
  return <LooseLink to={roleHref(experience, to)} {...rest} />;
}
