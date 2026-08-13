import { createContext, useContext, type ReactNode } from "react";

import type { Experience } from "./index";

/**
 * Active role experience for the current route subtree.
 *
 * Shared feature pages (Orders, Payments, Resources, Notifications, Profile)
 * are mounted once per role under /academic, /exam and /corporate. The thin
 * route wrapper declares which experience is active; every shared component
 * reads it from here instead of guessing from the URL.
 */
const ExperienceContext = createContext<Experience>("academic");

export function ExperienceProvider({
  experience,
  children,
}: {
  experience: Experience;
  children: ReactNode;
}) {
  return (
    <ExperienceContext.Provider value={experience}>{children}</ExperienceContext.Provider>
  );
}

export function useExperience(): Experience {
  return useContext(ExperienceContext);
}

export const EXPERIENCE_BASE: Record<Experience, string> = {
  academic: "/academic",
  exam: "/exam",
  corporate: "/corporate",
  admin: "/admin",
};

/** Prefixes a role-relative path (e.g. "/orders") with the experience base. */
export function roleHref(experience: Experience, path: string): string {
  const base = EXPERIENCE_BASE[experience];
  if (path === "/" || path === "") return base;
  return `${base}${path}`;
}
