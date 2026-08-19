import type { PaymentActivity } from "./api";

const PAYMENT_ACTIVITY_LABELS: Record<string, string> = {
  payment_approved: "Payment approved",
  replacement_proof_submitted: "Replacement proof submitted",
  payment_rejected: "Payment rejected",
  proof_submitted: "Proof submitted",
  payment_created: "Payment created",
};

export function paymentActivityLabel(activity: PaymentActivity): string {
  const title = activity.title?.trim();
  if (title && !isRawEventLabel(title, activity.event)) return title;
  return PAYMENT_ACTIVITY_LABELS[activity.event] ?? humaniseEvent(activity.event);
}

export function paymentActivityDescription(activity: PaymentActivity): string | null {
  const description = activity.description?.trim();
  if (!description) return null;
  if (description === activity.event || description === activity.title) return null;
  return description;
}

function isRawEventLabel(title: string, event: string) {
  return title === event || title.includes("_");
}

function humaniseEvent(event: string): string {
  if (!event) return "Payment activity recorded";
  return event.replace(/_/g, " ").replace(/^./, (char) => char.toUpperCase());
}
