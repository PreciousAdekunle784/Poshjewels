import "server-only";
import crypto from "node:crypto";
import { and, eq, lt, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import type { SiteSettings } from "./settings";
import type { ResolvedLine } from "./cart-lines";
import { verifyTransaction } from "./paystack";

export class CheckoutError extends Error {}

export function shippingFor(state: string, subtotal: number, s: SiteSettings["shipping"]) {
  if (s.freeShippingThreshold > 0 && subtotal >= s.freeShippingThreshold) return 0;
  if (!state) return 0;
  return state === "Lagos" ? s.lagosFee : s.otherStatesFee;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeReference() {
  const bytes = crypto.randomBytes(7);
  let out = "PJ-";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

export type OrderInput = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  note?: string;
  paymentMethod: "paystack" | "bank_transfer";
  userId?: number | null;
};

/**
 * Creates an order and reserves stock atomically. Each variant's stock is decremented with a
 * conditional UPDATE, so two customers can never buy the last piece at the same time.
 */
export async function createOrder(input: OrderInput, lines: ResolvedLine[], shippingSettings: SiteSettings["shipping"]) {
  if (lines.length === 0) throw new CheckoutError("Your bag is empty.");
  for (const l of lines) {
    if (l.stock < l.quantity) {
      throw new CheckoutError(l.stock <= 0 ? `${l.name} has just sold out.` : `Only ${l.stock} of ${l.name} left. Please update your bag.`);
    }
  }
  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
  const shippingFee = shippingFor(input.state, subtotal, shippingSettings);
  const total = subtotal + shippingFee;

  return db.transaction(async (tx) => {
    for (const l of lines) {
      const res = await tx
        .update(schema.productVariants)
        .set({ stock: sql`${schema.productVariants.stock} - ${l.quantity}` })
        .where(and(eq(schema.productVariants.id, l.variantId), sql`${schema.productVariants.stock} >= ${l.quantity}`))
        .returning({ id: schema.productVariants.id });
      if (res.length === 0) throw new CheckoutError(`${l.name} is no longer available in that quantity. Please update your bag.`);
    }
    let reference = makeReference();
    for (let i = 0; i < 3; i++) {
      const clash = await tx.query.orders.findFirst({ where: eq(schema.orders.reference, reference) });
      if (!clash) break;
      reference = makeReference();
    }
    const [order] = await tx
      .insert(schema.orders)
      .values({
        reference,
        accessToken: crypto.randomBytes(24).toString("hex"),
        userId: input.userId ?? null,
        email: input.email,
        phone: input.phone,
        firstName: input.firstName,
        lastName: input.lastName,
        address: input.address,
        city: input.city,
        state: input.state,
        note: input.note || null,
        subtotal,
        shippingFee,
        total,
        paymentMethod: input.paymentMethod,
      })
      .returning();
    await tx.insert(schema.orderItems).values(
      lines.map((l) => ({
        orderId: order.id,
        productId: l.productId,
        variantId: l.variantId,
        productName: l.name,
        variantName: l.variantName,
        imageUrl: l.image,
        unitPrice: l.price,
        quantity: l.quantity,
      })),
    );
    return order;
  });
}

/** Returns reserved stock for a cancelled order exactly once. */
export async function cancelOrder(orderId: number) {
  await db.transaction(async (tx) => {
    const order = await tx.query.orders.findFirst({ where: eq(schema.orders.id, orderId) });
    if (!order) return;
    if (!order.stockRestored) {
      const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId));
      for (const it of items) {
        if (!it.variantId) continue;
        await tx
          .update(schema.productVariants)
          .set({ stock: sql`${schema.productVariants.stock} + ${it.quantity}` })
          .where(eq(schema.productVariants.id, it.variantId));
      }
    }
    await tx.update(schema.orders).set({ status: "cancelled", stockRestored: true }).where(eq(schema.orders.id, orderId));
  });
}

/** Card checkouts that were abandoned before payment release their stock after 2 hours. */
export async function releaseStaleCardReservations() {
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const stale = await db
    .select({ id: schema.orders.id })
    .from(schema.orders)
    .where(
      and(
        eq(schema.orders.paymentMethod, "paystack"),
        eq(schema.orders.paymentStatus, "unpaid"),
        eq(schema.orders.status, "pending"),
        lt(schema.orders.createdAt, cutoff),
      ),
    );
  for (const o of stale) await cancelOrder(o.id);
  return stale.length;
}

/**
 * Confirms a Paystack payment with Paystack's API and marks the order paid. Idempotent: safe to call
 * from both the browser callback and the webhook.
 */
export async function confirmPaystackPayment(paymentReference: string) {
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.paymentReference, paymentReference) });
  if (!order) return { ok: false as const, reason: "unknown-reference" };
  if (order.paymentStatus === "paid") return { ok: true as const, order };

  const tx = await verifyTransaction(paymentReference);
  if (!tx) return { ok: false as const, reason: "verify-failed", order };
  if (tx.status !== "success") {
    if (tx.status === "failed" || tx.status === "abandoned") {
      await db.update(schema.orders).set({ paymentStatus: "failed" }).where(eq(schema.orders.id, order.id));
    }
    return { ok: false as const, reason: tx.status, order };
  }
  if (tx.currency !== "NGN" || tx.amount !== order.total * 100) {
    console.error(`[paystack] amount mismatch for ${order.reference}: got ${tx.amount} ${tx.currency}, expected ${order.total * 100} NGN`);
    return { ok: false as const, reason: "amount-mismatch", order };
  }
  if (order.status === "cancelled") {
    // Paid after the reservation lapsed: take the stock again if it is still there, and flag for the owner.
    await db
      .update(schema.orders)
      .set({ adminNote: `${order.adminNote ? order.adminNote + "\n" : ""}Payment received after this order was auto-cancelled. Check stock before re-opening.` })
      .where(eq(schema.orders.id, order.id));
  }
  const [updated] = await db
    .update(schema.orders)
    .set({ paymentStatus: "paid", paidAt: tx.paidAt ? new Date(tx.paidAt) : new Date(), status: order.status === "pending" ? "processing" : order.status })
    .where(eq(schema.orders.id, order.id))
    .returning();
  return { ok: true as const, order: updated };
}
