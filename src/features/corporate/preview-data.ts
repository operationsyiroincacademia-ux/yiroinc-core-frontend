import type { StatusTone } from "@/components/ui/status-badge";

/**
 * PREVIEW DATA ONLY — visual stage.
 *
 * Data sources at integration time:
 * - consulting requests: GET /dashboard/corporate
 * - orders:              GET /orders          (NOT part of /dashboard/corporate)
 * - procurements:        GET /procurements    (NOT part of /dashboard/corporate)
 *
 * Statuses below are restricted to the verified backend values.
 */

/** Verified consulting statuses. */
export type ConsultingStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "completed";

/** Verified procurement statuses. */
export type ProcurementStatus =
  | "pending"
  | "ordered"
  | "shipped"
  | "delivered";

export const CONSULTING_STATUS_LABEL: Record<ConsultingStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  in_progress: "In progress",
  completed: "Completed",
};

export const CONSULTING_STATUS_TONE: Record<ConsultingStatus, StatusTone> = {
  pending: "warning",
  assigned: "info",
  in_progress: "info",
  completed: "success",
};

export const PROCUREMENT_STATUS_LABEL: Record<ProcurementStatus, string> = {
  pending: "Pending",
  ordered: "Ordered",
  shipped: "Shipped",
  delivered: "Delivered",
};

export const PROCUREMENT_STATUS_TONE: Record<ProcurementStatus, StatusTone> = {
  pending: "warning",
  ordered: "info",
  shipped: "info",
  delivered: "success",
};

export type ConsultingRequest = {
  id: number;
  reference: string;
  service: string;
  engagement: string;
  submittedAt: string;
  status: ConsultingStatus;
  consultant?: string;
};

export type ProcurementRequest = {
  id: number;
  reference: string;
  item: string;
  quantity: string;
  submittedAt: string;
  status: ProcurementStatus;
};

export const CONSULTING_REQUESTS: ConsultingRequest[] = [
  {
    id: 4101,
    reference: "CON-2026-0031",
    service: "Organisational training needs assessment",
    engagement: "Advisory",
    submittedAt: "28 Jul 2026",
    status: "pending",
    consultant: "Not yet assigned",
  },
  {
    id: 4098,
    reference: "CON-2026-0027",
    service: "Research capability workshop design",
    engagement: "Workshop",
    submittedAt: "21 Jul 2026",
    status: "assigned",
    consultant: "Assigned consultant",
  },
  {
    id: 4090,
    reference: "CON-2026-0019",
    service: "Policy documentation review",
    engagement: "Advisory",
    submittedAt: "09 Jul 2026",
    status: "in_progress",
  },
];

export const PROCUREMENT_REQUESTS: ProcurementRequest[] = [
  {
    id: 3302,
    reference: "PRC-2026-0088",
    item: "Reference library subscription",
    quantity: "25 seats",
    submittedAt: "27 Jul 2026",
    status: "ordered",
  },
  {
    id: 3297,
    reference: "PRC-2026-0081",
    item: "Training materials print run",
    quantity: "120 units",
    submittedAt: "18 Jul 2026",
    status: "pending",
  },
];

