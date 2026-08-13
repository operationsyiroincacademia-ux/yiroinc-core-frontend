import type { StatusTone } from "@/components/ui/status-badge";

/**
 * PREVIEW DATA ONLY — visual stage.
 * Shape mirrors the resources listing (title, category/type, description,
 * date added) plus the protected file used for the access/download action
 * (GET /files/{id}/download, authenticated request).
 * No resource content is hardcoded inside page components; this module is
 * replaced by the API layer at integration time.
 */

export type Resource = {
  id: number;
  title: string;
  category: string;
  tone: StatusTone;
  description: string;
  addedAt: string;
  /** "download" = protected file, "link" = external/hosted access */
  access: "download" | "link";
  format: string;
  size?: string;
};

export const RESOURCE_CATEGORIES = [
  "All",
  "Guides",
  "Templates",
  "Webinars",
  "Policies",
] as const;

export const RESOURCES: Resource[] = [
  {
    id: 501,
    title: "Academic writing style guide",
    category: "Guides",
    tone: "info",
    description:
      "House conventions for structure, citation and tone used across YiroInc Academia reviews.",
    addedAt: "22 Jul 2026",
    access: "download",
    format: "PDF",
    size: "1.8 MB",
  },
  {
    id: 498,
    title: "Dissertation chapter template",
    category: "Templates",
    tone: "neutral",
    description:
      "Preformatted chapter skeleton with headings, figure captions and reference placeholders.",
    addedAt: "14 Jul 2026",
    access: "download",
    format: "DOCX",
    size: "420 KB",
  },
  {
    id: 490,
    title: "Research methodology masterclass",
    category: "Webinars",
    tone: "success",
    description:
      "Recorded session covering research design, sampling and data collection planning.",
    addedAt: "02 Jul 2026",
    access: "link",
    format: "Video",
  },
  {
    id: 486,
    title: "Referencing quick reference — APA 7",
    category: "Guides",
    tone: "info",
    description:
      "One-page summary of in-text citation and reference list rules with worked examples.",
    addedAt: "26 Jun 2026",
    access: "download",
    format: "PDF",
    size: "640 KB",
  },
  {
    id: 479,
    title: "Turnaround and revision policy",
    category: "Policies",
    tone: "warning",
    description:
      "How delivery timelines, revision rounds and rescheduling requests are handled.",
    addedAt: "12 Jun 2026",
    access: "download",
    format: "PDF",
    size: "310 KB",
  },
  {
    id: 471,
    title: "Literature review planning worksheet",
    category: "Templates",
    tone: "neutral",
    description:
      "Worksheet for mapping sources, themes and gaps before drafting a literature review.",
    addedAt: "30 May 2026",
    access: "download",
    format: "XLSX",
    size: "180 KB",
  },
];
