import type { StatusTone } from "@/components/ui/status-badge";

/**
 * PREVIEW DATA ONLY — visual stage.
 * Shape mirrors GET /payments (payment_reference, order_id, amount_paid,
 * created_at, verification status) plus the linked proof-of-payment file
 * (related_type = payment, file_type = proof_of_payment).
 * No payment values are hardcoded inside page components; this module is
 * replaced by the API layer at integration time.
 */

export type Payment = {
  id: number;
  reference: string;
  orderId: number;
  orderReference: string;
  amountPaid: string;
  submittedAt: string;
  status: string;
  tone: StatusTone;
  hasProof: boolean;
};

export const PAYMENTS: Payment[] = [
  {
    id: 1051,
    reference: "PMT-1051",
    orderId: 2094,
    orderReference: "ORD-2094",
    amountPaid: "₦120,000",
    submittedAt: "24 Jul 2026",
    status: "Verified",
    tone: "success",
    hasProof: true,
  },
  {
    id: 1043,
    reference: "PMT-1043",
    orderId: 2088,
    orderReference: "ORD-2088",
    amountPaid: "₦85,000",
    submittedAt: "18 Jul 2026",
    status: "Proof required",
    tone: "warning",
    hasProof: false,
  },
  {
    id: 1030,
    reference: "PMT-1030",
    orderId: 2071,
    orderReference: "ORD-2071",
    amountPaid: "₦64,000",
    submittedAt: "09 Jul 2026",
    status: "Awaiting verification",
    tone: "info",
    hasProof: true,
  },
  {
    id: 1012,
    reference: "PMT-1012",
    orderId: 2054,
    orderReference: "ORD-2054",
    amountPaid: "₦42,000",
    submittedAt: "28 Jun 2026",
    status: "Verified",
    tone: "success",
    hasProof: true,
  },
  {
    id: 1004,
    reference: "PMT-1004",
    orderId: 2032,
    orderReference: "ORD-2032",
    amountPaid: "₦18,000",
    submittedAt: "14 Jun 2026",
    status: "Verified",
    tone: "success",
    hasProof: true,
  },
  {
    id: 998,
    reference: "PMT-0998",
    orderId: 2011,
    orderReference: "ORD-2011",
    amountPaid: "₦96,000",
    submittedAt: "02 Jun 2026",
    status: "Rejected",
    tone: "danger",
    hasProof: true,
  },
];

export type PaymentProof = {
  id: number;
  name: string;
  fileType: "proof_of_payment";
  uploadedAt: string;
  size: string;
};

export type PaymentEvent = {
  id: number;
  label: string;
  detail?: string;
  at: string;
};

/** Linked via related_type = payment, related_id = payment ID. */
export const PAYMENT_PROOFS: Record<number, PaymentProof | null> = {
  1051: { id: 812, name: "PMT-1051_receipt.pdf", fileType: "proof_of_payment", uploadedAt: "24 Jul 2026", size: "340 KB" },
  1043: null,
  1030: { id: 781, name: "PMT-1030_transfer.jpg", fileType: "proof_of_payment", uploadedAt: "09 Jul 2026", size: "1.1 MB" },
  1012: { id: 702, name: "PMT-1012_receipt.pdf", fileType: "proof_of_payment", uploadedAt: "28 Jun 2026", size: "290 KB" },
  1004: { id: 655, name: "PMT-1004_receipt.pdf", fileType: "proof_of_payment", uploadedAt: "14 Jun 2026", size: "215 KB" },
  998: { id: 610, name: "PMT-0998_screenshot.png", fileType: "proof_of_payment", uploadedAt: "02 Jun 2026", size: "820 KB" },
};

export const PAYMENT_TIMELINE: Record<number, PaymentEvent[]> = {
  1051: [
    { id: 3, label: "Payment verified", detail: "Confirmed against ORD-2094.", at: "25 Jul 2026" },
    { id: 2, label: "Proof of payment uploaded", at: "24 Jul 2026" },
    { id: 1, label: "Payment record created", at: "24 Jul 2026" },
  ],
  1043: [
    { id: 1, label: "Payment record created", detail: "Awaiting proof of payment.", at: "18 Jul 2026" },
  ],
  1030: [
    { id: 2, label: "Proof of payment uploaded", detail: "Awaiting review by the finance team.", at: "09 Jul 2026" },
    { id: 1, label: "Payment record created", at: "09 Jul 2026" },
  ],
  1012: [
    { id: 3, label: "Payment verified", at: "29 Jun 2026" },
    { id: 2, label: "Proof of payment uploaded", at: "28 Jun 2026" },
    { id: 1, label: "Payment record created", at: "28 Jun 2026" },
  ],
  1004: [
    { id: 3, label: "Payment verified", at: "15 Jun 2026" },
    { id: 2, label: "Proof of payment uploaded", at: "14 Jun 2026" },
    { id: 1, label: "Payment record created", at: "14 Jun 2026" },
  ],
  998: [
    { id: 3, label: "Payment rejected", detail: "Receipt could not be matched to a transfer.", at: "04 Jun 2026" },
    { id: 2, label: "Proof of payment uploaded", at: "02 Jun 2026" },
    { id: 1, label: "Payment record created", at: "02 Jun 2026" },
  ],
};

export function findPayment(id: number) {
  return PAYMENTS.find((payment) => payment.id === id);
}
