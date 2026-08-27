import type { StatusTone } from "@/components/ui/status-badge";
import { humaniseStatus } from "@/features/commerce/format";
import {
  EXAM_OPTIONS as SHARED_EXAM_OPTIONS,
  LEVEL_OPTIONS as SHARED_LEVEL_OPTIONS,
} from "@/features/exam/options";
import type { AdminTutor } from "./api";

export const EXAM_OPTIONS = SHARED_EXAM_OPTIONS;

export const LEVEL_OPTIONS: Record<string, { label: string; value: string }[]> = {
  CFA: [...SHARED_LEVEL_OPTIONS.CFA],
  FRM: [...SHARED_LEVEL_OPTIONS.FRM],
};

export function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
  }
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string => typeof item === "string" && item.trim() !== "",
      );
    }
  } catch {
    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function levelLabel(value: string): string {
  return (
    Object.values(LEVEL_OPTIONS)
      .flat()
      .find((option) => option.value === value)?.label ?? value
  );
}

export function expertiseText(tutor: AdminTutor | null | undefined): string {
  const values = normalizeStringList(tutor?.exam_expertise);
  return values.length > 0 ? values.join(", ") : "-";
}

export function levelsText(tutor: AdminTutor | null | undefined): string {
  const values = normalizeStringList(tutor?.levels);
  return values.length > 0 ? values.map(levelLabel).join(", ") : "-";
}

export function availabilityBadge(status: string | null | undefined): {
  label: string;
  tone: StatusTone;
} {
  if (status === "available") return { label: "Available", tone: "success" };
  if (status === "unavailable") return { label: "Unavailable", tone: "neutral" };
  return { label: status ? humaniseStatus(status) : "-", tone: "neutral" };
}

export function statusBadge(status: string | null | undefined): {
  label: string;
  tone: StatusTone;
} {
  if (status === "active") return { label: "Active", tone: "success" };
  if (status === "inactive") return { label: "Inactive", tone: "neutral" };
  return { label: status ? humaniseStatus(status) : "-", tone: "neutral" };
}
