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
 * and GET /auth/me. Admin identity comes from auth/user flags. User-facing
 * experience remains profile-based until the admin route ecosystem exists.
 */
export function useCurrentUser(): CurrentUser {
  const { user, profile, isAdmin } = useAuth();
  const routeExperience = useExperience();
  const profileType = profile?.profile_type ?? null;

  return {
    id: user?.id ?? 0,
    displayName: user?.name ?? "",
    email: user?.email ?? "",
    profileType,
    isAdmin,
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
