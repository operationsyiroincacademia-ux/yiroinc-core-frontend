import { formatMoney, toNumber } from "@/features/commerce/format";
import type { Resource, ResourceAudience } from "@/features/resources/api";

const AUDIENCE_LABELS: Record<ResourceAudience, string> = {
  academic: "Academic",
  exam_candidate: "Exam Candidates",
  corporate: "Corporate",
};

const AUDIENCE_DETAIL_LABELS: Record<ResourceAudience, string> = {
  academic: "Academic Users",
  exam_candidate: "Exam Candidates",
  corporate: "Corporate Users",
};

export function resourceLevelLabel(level: string | null | undefined) {
  if (level === "level_1") return "Level I";
  if (level === "level_2") return "Level II";
  if (level === "level_3") return "Level III";
  if (level === "part_1") return "Part I";
  if (level === "part_2") return "Part II";
  return level || "-";
}

export function resourcePriceLabel(resource: Resource) {
  const amount = toNumber(resource.price);
  if (amount <= 0) return "Free";
  return formatMoney(amount, resource.currency || "NGN");
}

export function normalizeResourceAudiences(resource: Pick<Resource, "audiences">) {
  return (Array.isArray(resource.audiences) ? resource.audiences : []).filter(
    (audience): audience is ResourceAudience =>
      audience === "academic" || audience === "exam_candidate" || audience === "corporate",
  );
}

export function resourceHasExamAudience(resource: Pick<Resource, "audiences">) {
  return normalizeResourceAudiences(resource).includes("exam_candidate");
}

export function resourceAudienceLabel(resource: Pick<Resource, "audiences">) {
  const audiences = normalizeResourceAudiences(resource);
  if (audiences.length === 3) return "All audiences";
  if (audiences.length === 0) return "-";
  return audiences.map((audience) => AUDIENCE_LABELS[audience]).join(", ");
}

export function resourceAudienceDetailLabel(audience: ResourceAudience) {
  return AUDIENCE_DETAIL_LABELS[audience];
}
