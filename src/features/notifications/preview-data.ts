import type { StatusTone } from "@/components/ui/status-badge";

/**
 * PREVIEW DATA ONLY — visual stage.
 * Shape mirrors the Notifications API (title, message, created date/time,
 * read state, category). At integration time this module is replaced by the
 * notifications endpoints; mark-as-read / dismiss become authenticated calls.
 */

export type Notification = {
  id: number;
  title: string;
  message: string;
  /** Human readable date/time as returned for display */
  createdAt: string;
  read: boolean;
  category: string;
  tone: StatusTone;
};

export const NOTIFICATIONS: Notification[] = [
  {
    id: 9012,
    title: "Proof of payment required",
    message:
      "Payment PAY-2026-0418 has been recorded but no proof of payment has been uploaded yet.",
    createdAt: "30 Jul 2026 · 14:22",
    read: false,
    category: "Payments",
    tone: "warning",
  },
  {
    id: 9008,
    title: "Order moved to in review",
    message:
      "Order ORD-2026-1184 is now with the review team. You will be notified when it is completed.",
    createdAt: "29 Jul 2026 · 09:05",
    read: false,
    category: "Orders",
    tone: "info",
  },
  {
    id: 8994,
    title: "Payment verified",
    message:
      "Payment PAY-2026-0407 of £240.00 has been verified and applied to order ORD-2026-1177.",
    createdAt: "26 Jul 2026 · 16:48",
    read: true,
    category: "Payments",
    tone: "success",
  },
  {
    id: 8981,
    title: "New resource available",
    message:
      "The academic writing style guide has been added to your resources library.",
    createdAt: "22 Jul 2026 · 11:10",
    read: true,
    category: "Resources",
    tone: "neutral",
  },
  {
    id: 8963,
    title: "Order completed",
    message:
      "Order ORD-2026-1169 has been completed and the deliverable is available to download.",
    createdAt: "18 Jul 2026 · 08:34",
    read: true,
    category: "Orders",
    tone: "success",
  },
];
