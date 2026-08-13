import type { ProfileType } from "@/lib/roles";

/**
 * PREVIEW DATA ONLY — visual stage.
 * Shape mirrors the Profile API record. `profileType` and `email` are shown
 * read-only here because they are account-level values, not fields the user
 * edits from this page. Replaced by the Profile API at integration time.
 */

export type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileType: ProfileType;
  organisation: string;
};

export const PROFILE: Profile = {
  firstName: "Ada",
  lastName: "Okonkwo",
  email: "ada@example.com",
  phone: "+44 7700 900412",
  profileType: "academic_user",
  organisation: "University of Leeds",
};
