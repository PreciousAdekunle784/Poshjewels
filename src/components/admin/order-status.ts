import type { Order } from "@/db/schema";

export function ORDER_LABEL(o: Pick<Order, "status" | "paymentStatus">) {
  if (o.status === "cancelled") return "Cancelled";
  if (o.paymentStatus === "failed") return "Payment failed";
  if (o.paymentStatus !== "paid") return "Awaiting payment";
  return { pending: "Paid · new", processing: "Paid · preparing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" }[o.status];
}

export function orderTone(o: Pick<Order, "status" | "paymentStatus">): "neutral" | "good" | "warn" | "bad" {
  if (o.status === "cancelled" || o.paymentStatus === "failed") return "bad";
  if (o.paymentStatus !== "paid") return "warn";
  if (o.status === "delivered") return "neutral";
  return "good";
}
