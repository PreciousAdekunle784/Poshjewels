import "server-only";
import crypto from "node:crypto";

const API = "https://api.paystack.co";

export function paystackEnabled() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

function secret() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  return key;
}

export async function initializeTransaction(input: { email: string; amountNaira: number; reference: string; callbackUrl: string; metadata?: Record<string, unknown> }) {
  const res = await fetch(`${API}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amountNaira * 100), // kobo
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as { status?: boolean; message?: string; data?: { authorization_url: string; reference: string } } | null;
  if (!res.ok || !json?.status || !json.data) {
    throw new Error(json?.message ?? `Paystack initialize failed (${res.status})`);
  }
  return json.data;
}

export type VerifiedTransaction = { status: string; reference: string; amount: number; currency: string; paidAt: string | null; channel?: string };

/** Always confirm a payment server-to-server before marking an order paid. */
export async function verifyTransaction(reference: string): Promise<VerifiedTransaction | null> {
  const res = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret()}` },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as { status?: boolean; data?: { status: string; reference: string; amount: number; currency: string; paid_at: string | null; channel?: string } } | null;
  if (!res.ok || !json?.status || !json.data) return null;
  const d = json.data;
  return { status: d.status, reference: d.reference, amount: d.amount, currency: d.currency, paidAt: d.paid_at, channel: d.channel };
}

/** Validates the x-paystack-signature header (HMAC SHA-512 of the raw body with the secret key). */
export function validWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false;
  const expected = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
