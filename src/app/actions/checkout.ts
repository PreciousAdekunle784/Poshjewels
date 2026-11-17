"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { resolveLines } from "@/lib/cart-lines";
import { CheckoutError, createOrder, cancelOrder, releaseStaleCardReservations } from "@/lib/orders";
import { initializeTransaction, paystackEnabled } from "@/lib/paystack";
import { getSettings } from "@/lib/settings";
import { NIGERIAN_STATES, SITE_URL } from "@/lib/site";

export type CheckoutState = { ok: false; message: string; errors?: Record<string, string> } | { ok: true; redirectTo: string } | null;

const schemaIn = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{7,20}$/, "Enter a valid phone number."),
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().min(1, "Enter your last name.").max(80),
  address: z.string().trim().min(5, "Enter your delivery address.").max(300),
  city: z.string().trim().min(2, "Enter your city or town.").max(80),
  state: z.enum(NIGERIAN_STATES, { message: "Choose your state." }),
  note: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(["paystack", "bank_transfer"], { message: "Choose a payment method." }),
  lines: z.string(),
});

export async function placeOrderAction(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const parsed = schemaIn.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }
  const data = parsed.data;

  let rawLines: { variantId: number; quantity: number }[] = [];
  try {
    const arr = JSON.parse(data.lines);
    if (Array.isArray(arr)) rawLines = arr.slice(0, 100);
  } catch {
    return { ok: false, message: "We couldn't read your bag. Please refresh the page and try again." };
  }

  const settings = await getSettings(["shipping", "bank"]);
  if (data.paymentMethod === "paystack" && !paystackEnabled()) return { ok: false, message: "Card payment isn't available right now. Please choose bank transfer." };
  if (data.paymentMethod === "bank_transfer" && !settings.bank.enabled) return { ok: false, message: "Bank transfer isn't available right now." };

  await releaseStaleCardReservations();
  const lines = await resolveLines(rawLines);
  if (lines.length === 0) return { ok: false, message: "Your bag is empty." };

  const session = await getSession();
  let order;
  try {
    order = await createOrder({ ...data, userId: session?.userId ?? null }, lines, settings.shipping);
  } catch (e) {
    if (e instanceof CheckoutError) return { ok: false, message: e.message };
    console.error("[checkout] createOrder failed", e);
    return { ok: false, message: "Something went wrong while placing your order. Your card has not been charged. Please try again." };
  }

  const confirmation = `/order/${order.reference}?t=${order.accessToken}`;

  if (data.paymentMethod === "paystack") {
    const paymentReference = `${order.reference}-${Date.now().toString(36).toUpperCase()}`;
    try {
      await db.update(schema.orders).set({ paymentReference }).where(eq(schema.orders.id, order.id));
      const init = await initializeTransaction({
        email: order.email,
        amountNaira: order.total,
        reference: paymentReference,
        callbackUrl: `${SITE_URL}/api/paystack/callback`,
        metadata: { orderReference: order.reference },
      });
      return { ok: true, redirectTo: init.authorization_url };
    } catch (e) {
      console.error("[checkout] Paystack initialize failed", e);
      await cancelOrder(order.id);
      return { ok: false, message: "We couldn't connect to the payment provider. Nothing was charged. Please try again or choose bank transfer." };
    }
  }

  return { ok: true, redirectTo: confirmation };
}
