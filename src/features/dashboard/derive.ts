import { formatDate, formatMoney, toFlag, toNumber } from "@/features/commerce/format";
import type { Order } from "@/features/orders/api";
import type { Notification } from "@/features/notifications/api";
import type { TimelineEvent } from "./api";

export function countActiveOrders(orders: Order[]) {
  return orders.filter((order) => !["completed", "cancelled"].includes(order.order_status)).length;
}

export function countPendingPayments(orders: Order[]) {
  return orders.filter((order) => {
    const status = order.related_payment_status ?? order.payment_status;
    if (status === "rejected") return false;
    if (order.payment_id) return status === "pending";
    return (
      order.payment_status === "pending" && !["completed", "cancelled"].includes(order.order_status)
    );
  }).length;
}

export function countUnreadNotifications(notifications: Notification[]) {
  return notifications.filter((notification) => !toFlag(notification.is_read)).length;
}

export function findOrderNeedingProof(orders: Order[]) {
  return orders.find((order) => {
    if (["completed", "cancelled"].includes(order.order_status)) return false;
    if ((order.related_payment_status ?? null) === "rejected") return false;
    if (toFlag(order.has_pop)) return false;
    if (!order.payment_id) return true;
    return (order.related_payment_status ?? order.payment_status) === "pending";
  });
}

export function orderAmount(order: Order) {
  const amount = toNumber(order.total_price);
  return order.currency ? formatMoney(amount, order.currency) : amount.toLocaleString();
}

export function timelineText(event: TimelineEvent) {
  return event.description ? `${event.title}: ${event.description}` : event.title || event.event;
}

export function timelineTime(event: TimelineEvent) {
  return formatDate(event.created_at);
}
