import { NextResponse, type NextRequest } from "next/server";
import { db, schema } from "@/db";
import { confirmPaystackPayment } from "@/lib/orders";
import { validWebhookSignature } from "@/lib/paystack";

/**
 * Paystack webhook (set the URL to https://<your-domain>/api/paystack/webhook in the Paystack dashboard).
 * The signature is checked, then the transaction is re-verified with Paystack's API before the order is marked paid.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!validWebhookSignature(raw, req.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const reference = event.data?.reference;
  if (event.event && reference) {
    await db.insert(schema.paymentEvents).values({ provider: "paystack", reference, event: event.event, payload: raw }).onConflictDoNothing();
    if (event.event === "charge.success") await confirmPaystackPayment(reference);
  }
  return NextResponse.json({ ok: true });
}
