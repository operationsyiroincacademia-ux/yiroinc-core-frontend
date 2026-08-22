import type { AdminUser } from "@/features/admin/api";
import { resourceLevelLabel } from "@/features/admin/resource-format";

export const ADMIN_USER_TYPE_LABELS: Record<string, string> = {
  academic_user: "Academic User",
  cfa_candidate: "CFA Candidate",
  frm_candidate: "FRM Candidate",
  exam_candidate: "Exam Candidate",
  corporate_client: "Corporate User",
  consulting_lead: "Consulting Lead",
};

export function adminUserTypeLabel(value: string | null | undefined) {
  if (!value) return "-";
  return ADMIN_USER_TYPE_LABELS[value] ?? value.replace(/_/g, " ");
}

export function adminUserDisplayName(user: AdminUser) {
  const displayName = clean(user.display_name);
  if (displayName) return displayName;
  const name = [clean(user.first_name), clean(user.last_name)].filter(Boolean).join(" ");
  if (name) return name;
  return clean(user.email) || `User #${user.id}`;
}

export function adminUserJoinedAt(user: AdminUser) {
  return user.registered_at ?? user.created_at ?? null;
}

export function examLevelLabel(value: string | null | undefined) {
  return resourceLevelLabel(value);
}

function clean(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "";
}
