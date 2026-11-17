import "server-only";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "./auth";

/** An order is visible to: the holder of its access token, the signed-in customer who placed it, or an admin. */
export async function getViewableOrder(reference: string, token: string | undefined) {
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.reference, reference) });
  if (!order) return null;
  let allowed = false;
  if (token && token.length === order.accessToken.length) {
    allowed = crypto.timingSafeEqual(Buffer.from(token), Buffer.from(order.accessToken));
  }
  if (!allowed) {
    const session = await getSession();
    allowed = !!session && (session.role === "admin" || (order.userId !== null && session.userId === order.userId));
  }
  if (!allowed) return null;
  const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, order.id));
  return { order, items };
}
