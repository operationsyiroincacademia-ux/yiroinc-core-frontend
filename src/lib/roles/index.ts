/**
 * Role model for the YiroInc Academia Portal.
 *
 * The API classifies authenticated users with `profile_type`. The portal groups
 * those values into three user experiences, plus the administrator experience
 * (derived from the account's admin capability, not from profile_type).
 *
 * NOTE: service visibility per experience is a FRONTEND affordance only.
 * The backend protects these endpoints by authentication / admin access,
 * not strictly by profile_type.
 */

export type ProfileType =
  | "academic_user"
  | "exam_candidate"
  | "cfa_candidate"
  | "frm_candidate"
  | "corporate_client"
  | "consulting_lead";

export type Experience = "academic" | "exam" | "corporate" | "admin";

/**
 * `consulting_lead` is intentionally absent: it is an internal CRM
 * classification and does not map to a portal dashboard experience.
 */
export const PROFILE_TYPE_TO_EXPERIENCE: Partial<Record<ProfileType, Experience>> = {
  academic_user: "academic",
  exam_candidate: "exam",
  cfa_candidate: "exam",
  frm_candidate: "exam",
  corporate_client: "corporate",
};

export const EXPERIENCE_LABEL: Record<Experience, string> = {
  academic: "Academic User",
  exam: "Exam Candidate",
  corporate: "Corporate User",
  admin: "Administrator",
};

/**
 * Specific profile type labels. The grouped experience label is used in the
 * shell (sidebar footer, topbar); the specific label is shown on the profile
 * page when the API reports it.
 */
export const PROFILE_TYPE_LABEL: Record<ProfileType, string> = {
  academic_user: "Academic User",
  exam_candidate: "Exam Candidate",
  cfa_candidate: "CFA Candidate",
  frm_candidate: "FRM Candidate",
  corporate_client: "Corporate Client",
  consulting_lead: "Consulting Lead",
};

export function resolveExperience(
  profileType: ProfileType | null | undefined,
  isAdmin: boolean,
  fallback: Experience = "academic",
): Experience {
  if (isAdmin) return "admin";
  const mapped = profileType ? PROFILE_TYPE_TO_EXPERIENCE[profileType] : undefined;
  return mapped ?? fallback;
}
