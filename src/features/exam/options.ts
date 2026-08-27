export const EXAM_OPTIONS = ["CFA", "FRM"] as const;

export type ExamType = (typeof EXAM_OPTIONS)[number];

export const LEVEL_OPTIONS = {
  CFA: [
    { label: "Level I", value: "level_1" },
    { label: "Level II", value: "level_2" },
    { label: "Level III", value: "level_3" },
  ],
  FRM: [
    { label: "Part I", value: "part_1" },
    { label: "Part II", value: "part_2" },
  ],
} as const satisfies Record<ExamType, readonly { label: string; value: string }[]>;

export type ExamLevel = (typeof LEVEL_OPTIONS)[ExamType][number]["value"];

const LEVEL_ALIASES: Record<ExamType, Record<string, ExamLevel>> = {
  CFA: {
    "1": "level_1",
    i: "level_1",
    l1: "level_1",
    level1: "level_1",
    level_1: "level_1",
    level_i: "level_1",
    "2": "level_2",
    ii: "level_2",
    l2: "level_2",
    level2: "level_2",
    level_2: "level_2",
    level_ii: "level_2",
    "3": "level_3",
    iii: "level_3",
    l3: "level_3",
    level3: "level_3",
    level_3: "level_3",
    level_iii: "level_3",
  },
  FRM: {
    "1": "part_1",
    i: "part_1",
    p1: "part_1",
    part1: "part_1",
    part_1: "part_1",
    part_i: "part_1",
    "2": "part_2",
    ii: "part_2",
    p2: "part_2",
    part2: "part_2",
    part_2: "part_2",
    part_ii: "part_2",
  },
};

export function examLevelLabel(value: string | null | undefined): string {
  const found = Object.values(LEVEL_OPTIONS)
    .flat()
    .find((option) => option.value === value);
  return found?.label ?? (value || "-");
}

export function normalizeExamLevel(
  value: string | null | undefined,
  examType: ExamType,
): ExamLevel | "" {
  const normalized = (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_");
  if (!normalized) return "";
  return LEVEL_ALIASES[examType][normalized] ?? "";
}
