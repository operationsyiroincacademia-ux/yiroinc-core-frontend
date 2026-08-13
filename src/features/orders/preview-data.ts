import type { StatusTone } from "@/components/ui/status-badge";

/**
 * PREVIEW DATA ONLY.
 * Shapes mirror the WordPress REST API responses:
 *   GET /orders, GET /orders/{id}, GET /payments, GET /timeline.
 * Nothing here is rendered from hardcoded values inside components —
 * the pages read from these modules today and will read from the API
 * layer once integration begins. Delete this file at that point.
 */

export type Order = {
  id: number;
  reference: string;
  service: string;
  amount: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  tone: StatusTone;
  description: string;
  quantity: number;
  deliveryMethod: string;
};

export type OrderPayment = {
  id: number;
  reference: string;
  amountPaid: string;
  submittedAt: string;
  status: string;
  tone: StatusTone;
  hasProof: boolean;
};

export type OrderFile = {
  id: number;
  name: string;
  fileType: string;
  uploadedAt: string;
  size: string;
};

export type TimelineEvent = {
  id: number;
  label: string;
  detail?: string;
  at: string;
};

export const ORDERS: Order[] = [
  {
    id: 2094,
    reference: "ORD-2094",
    service: "Dissertation review — Chapter 3",
    amount: "₦120,000",
    createdAt: "24 Jul 2026",
    updatedAt: "30 Jul 2026",
    status: "In progress",
    tone: "info",
    description:
      "Full academic review of Chapter 3 (methodology), including structure, argument flow and referencing consistency.",
    quantity: 1,
    deliveryMethod: "Digital delivery",
  },
  {
    id: 2088,
    reference: "ORD-2088",
    service: "Research methodology coaching",
    amount: "₦85,000",
    createdAt: "18 Jul 2026",
    updatedAt: "20 Jul 2026",
    status: "Awaiting payment",
    tone: "warning",
    description:
      "Two coaching sessions covering research design, sampling strategy and data collection planning.",
    quantity: 2,
    deliveryMethod: "Scheduled sessions",
  },
  {
    id: 2071,
    reference: "ORD-2071",
    service: "Document review — journal submission",
    amount: "₦64,000",
    createdAt: "09 Jul 2026",
    updatedAt: "15 Jul 2026",
    status: "Under review",
    tone: "neutral",
    description:
      "Pre-submission review of a manuscript prepared for a peer-reviewed journal.",
    quantity: 1,
    deliveryMethod: "Digital delivery",
  },
  {
    id: 2054,
    reference: "ORD-2054",
    service: "Proofreading — conference paper",
    amount: "₦42,000",
    createdAt: "28 Jun 2026",
    updatedAt: "02 Jul 2026",
    status: "Completed",
    tone: "success",
    description: "Language and formatting proofread of an 8-page conference paper.",
    quantity: 1,
    deliveryMethod: "Digital delivery",
  },
  {
    id: 2032,
    reference: "ORD-2032",
    service: "Plagiarism check and report",
    amount: "₦18,000",
    createdAt: "14 Jun 2026",
    updatedAt: "16 Jun 2026",
    status: "Completed",
    tone: "success",
    description: "Similarity check with an annotated originality report.",
    quantity: 1,
    deliveryMethod: "Digital delivery",
  },
  {
    id: 2011,
    reference: "ORD-2011",
    service: "Statistical analysis support",
    amount: "₦96,000",
    createdAt: "02 Jun 2026",
    updatedAt: "05 Jun 2026",
    status: "Cancelled",
    tone: "danger",
    description: "Support with regression analysis and interpretation of results.",
    quantity: 1,
    deliveryMethod: "Digital delivery",
  },
];

export const ORDER_PAYMENTS: Record<number, OrderPayment[]> = {
  2094: [
    {
      id: 1051,
      reference: "PMT-1051",
      amountPaid: "₦120,000",
      submittedAt: "24 Jul 2026",
      status: "Verified",
      tone: "success",
      hasProof: true,
    },
  ],
  2088: [
    {
      id: 1043,
      reference: "PMT-1043",
      amountPaid: "₦85,000",
      submittedAt: "18 Jul 2026",
      status: "Proof required",
      tone: "warning",
      hasProof: false,
    },
  ],
  2071: [
    {
      id: 1030,
      reference: "PMT-1030",
      amountPaid: "₦64,000",
      submittedAt: "09 Jul 2026",
      status: "Awaiting verification",
      tone: "info",
      hasProof: true,
    },
  ],
  2054: [
    {
      id: 1012,
      reference: "PMT-1012",
      amountPaid: "₦42,000",
      submittedAt: "28 Jun 2026",
      status: "Verified",
      tone: "success",
      hasProof: true,
    },
  ],
  2032: [
    {
      id: 1004,
      reference: "PMT-1004",
      amountPaid: "₦18,000",
      submittedAt: "14 Jun 2026",
      status: "Verified",
      tone: "success",
      hasProof: true,
    },
  ],
  2011: [],
};

export const ORDER_FILES: Record<number, OrderFile[]> = {
  2094: [
    {
      id: 811,
      name: "Chapter3_draft.docx",
      fileType: "order_document",
      uploadedAt: "24 Jul 2026",
      size: "1.2 MB",
    },
    {
      id: 812,
      name: "PMT-1051_receipt.pdf",
      fileType: "proof_of_payment",
      uploadedAt: "24 Jul 2026",
      size: "340 KB",
    },
  ],
  2088: [],
  2071: [
    {
      id: 780,
      name: "Manuscript_v2.pdf",
      fileType: "order_document",
      uploadedAt: "09 Jul 2026",
      size: "2.4 MB",
    },
  ],
  2054: [],
  2032: [],
  2011: [],
};

export const ORDER_TIMELINE: Record<number, TimelineEvent[]> = {
  2094: [
    { id: 4, label: "Work in progress", detail: "Assigned to the academic review team.", at: "30 Jul 2026" },
    { id: 3, label: "Payment verified", detail: "PMT-1051 confirmed.", at: "25 Jul 2026" },
    { id: 2, label: "Proof of payment uploaded", at: "24 Jul 2026" },
    { id: 1, label: "Order placed", at: "24 Jul 2026" },
  ],
  2088: [
    { id: 2, label: "Payment record created", detail: "PMT-1043 awaiting proof of payment.", at: "18 Jul 2026" },
    { id: 1, label: "Order placed", at: "18 Jul 2026" },
  ],
  2071: [
    { id: 3, label: "Under review", at: "15 Jul 2026" },
    { id: 2, label: "Proof of payment uploaded", at: "09 Jul 2026" },
    { id: 1, label: "Order placed", at: "09 Jul 2026" },
  ],
  2054: [
    { id: 2, label: "Order completed", at: "02 Jul 2026" },
    { id: 1, label: "Order placed", at: "28 Jun 2026" },
  ],
  2032: [
    { id: 2, label: "Order completed", at: "16 Jun 2026" },
    { id: 1, label: "Order placed", at: "14 Jun 2026" },
  ],
  2011: [
    { id: 2, label: "Order cancelled", at: "05 Jun 2026" },
    { id: 1, label: "Order placed", at: "02 Jun 2026" },
  ],
};

export function findOrder(id: number) {
  return ORDERS.find((order) => order.id === id);
}
