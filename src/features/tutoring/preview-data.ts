import type { StatusTone } from "@/components/ui/status-badge";

/**
 * PREVIEW DATA ONLY — visual stage.
 * Shape mirrors tutoring request records (reference, exam type, exam level,
 * preferred timezone and language, submission date, status, assigned tutor).
 * Status labels are placeholders until the backend values are confirmed at
 * integration time; the tone mapping lives in TUTORING_STATUS_TONE.
 */

export type TutoringRequest = {
  id: number;
  reference: string;
  examType: string;
  examLevel: string;
  timezone: string;
  language: string;
  submittedAt: string;
  status: string;
  tone: StatusTone;
  tutor: string | null;
  notes: string;
  matchedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  /** Retained for the dashboard summary rows. */
  subject: string;
  mode: string;
  requestedFor: string;
};

export const TUTORING_STATUSES = [
  "All",
  "Scheduled",
  "Awaiting assignment",
  "Under review",
  "Completed",
  "Cancelled",
] as const;

export const TUTORING_REQUESTS: TutoringRequest[] = [
  {
    id: 3101,
    reference: "TUT-0312",
    examType: "CFA",
    examLevel: "Level II",
    timezone: "WAT (UTC+1)",
    language: "English",
    submittedAt: "27 Jul 2026",
    status: "Scheduled",
    tone: "success",
    tutor: "Dr. Ibrahim Yusuf",
    subject: "CFA Level II — Equity Valuation",
    mode: "Online, 1:1",
    requestedFor: "05 Aug 2026",
    notes:
      "I need focused support on equity valuation models ahead of the August sitting. Evenings after 18:00 WAT work best.",
    matchedAt: "28 Jul 2026, 09:40",
    startedAt: "01 Aug 2026, 17:00",
    completedAt: null,
  },
  {
    id: 3098,
    reference: "TUT-0309",
    examType: "FRM",
    examLevel: "Part I",
    timezone: "GMT (UTC+0)",
    language: "English",
    submittedAt: "22 Jul 2026",
    status: "Awaiting assignment",
    tone: "warning",
    tutor: null,
    subject: "FRM Part I — Quantitative Analysis",
    mode: "Online, group",
    requestedFor: "12 Aug 2026",
    notes:
      "Struggling with probability distributions and hypothesis testing. Happy to join a small group.",
    matchedAt: null,
    startedAt: null,
    completedAt: null,
  },
  {
    id: 3090,
    reference: "TUT-0301",
    examType: "CFA",
    examLevel: "Level II",
    timezone: "CET (UTC+2)",
    language: "French",
    submittedAt: "18 Jul 2026",
    status: "Under review",
    tone: "info",
    tutor: null,
    subject: "CFA Level II — Fixed Income",
    mode: "Online, 1:1",
    requestedFor: "18 Aug 2026",
    notes:
      "Prefer a French-speaking tutor for fixed income analytics. Weekend sessions preferred.",
    matchedAt: null,
    startedAt: null,
    completedAt: null,
  },
  {
    id: 3081,
    reference: "TUT-0294",
    examType: "FRM",
    examLevel: "Part I",
    timezone: "WAT (UTC+1)",
    language: "English",
    submittedAt: "20 Jun 2026",
    status: "Completed",
    tone: "neutral",
    tutor: "Chinelo Adeyemi",
    subject: "FRM Part I — Financial Markets and Products",
    mode: "Online, group",
    requestedFor: "02 Jul 2026",
    notes:
      "Needed a refresher on derivatives and futures markets before the July sitting.",
    matchedAt: "21 Jun 2026, 11:15",
    startedAt: "25 Jun 2026, 16:00",
    completedAt: "02 Jul 2026, 18:30",
  },
];

export function findTutoringRequest(id: number): TutoringRequest | undefined {
  return TUTORING_REQUESTS.find((request) => request.id === id);
}

/** Option lists for the new request form (visual stage placeholders). */
export const EXAM_TYPE_OPTIONS = ["CFA", "FRM", "CAIA", "ACCA", "Other"];

export const EXAM_LEVEL_OPTIONS: Record<string, string[]> = {
  CFA: ["Level I", "Level II", "Level III"],
  FRM: ["Part I", "Part II"],
  CAIA: ["Level I", "Level II"],
  ACCA: ["Applied Knowledge", "Applied Skills", "Strategic Professional"],
  Other: ["Not applicable"],
};

export const TIMEZONE_OPTIONS = [
  "WAT (UTC+1)",
  "GMT (UTC+0)",
  "CET (UTC+2)",
  "EST (UTC-5)",
  "PST (UTC-8)",
  "GST (UTC+4)",
  "SGT (UTC+8)",
];

export const LANGUAGE_OPTIONS = ["English", "French", "Portuguese", "Arabic"];
