import type { Experience, ProfileType } from "../roles";
import { resolveExperience } from "../roles";
import { useExperience } from "../roles/experience-context";
import { useAuth } from "./auth-context";

export type CurrentUser = {
  id: number;
  displayName: string;
  email: string;
  profileType: ProfileType | null;
  isAdmin: boolean;
  experience: Experience;
  unreadNotifications: number;
};

/**
 * The authenticated user, sourced from POST /auth/login, POST /auth/register
 * and GET /auth/me. `profile_type` is the source of truth for the experience;
 * when it is unavailable the active route's experience context is used so the
 * shell never falls back to a hardcoded "Academic" identity.
 */
export function useCurrentUser(): CurrentUser {
  const { user, profile } = useAuth();
  const routeExperience = useExperience();
  const profileType = profile?.profile_type ?? null;

  return {
    id: user?.id ?? 0,
    displayName: user?.name ?? "",
    email: user?.email ?? "",
    profileType,
    isAdmin: false,
    experience: resolveExperience(profileType, false, routeExperience),
    unreadNotifications: 0,
  };
}

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
