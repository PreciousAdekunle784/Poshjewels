import { NextResponse, type NextRequest } from "next/server";
import { confirmPaystackPayment } from "@/lib/orders";
import { SITE_URL } from "@/lib/site";

/** Paystack redirects the customer here after payment. We verify server-side before showing success. */
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference") ?? req.nextUrl.searchParams.get("trxref");
  if (!reference) return NextResponse.redirect(`${SITE_URL}/cart`);
  const result = await confirmPaystackPayment(reference);
  if (!result.order) return NextResponse.redirect(`${SITE_URL}/cart`);
  const url = new URL(`${SITE_URL}/order/${result.order.reference}`);
  url.searchParams.set("t", result.order.accessToken);
  if (!result.ok && (result.reason === "failed" || result.reason === "abandoned")) url.searchParams.set("payment", "failed");
  return NextResponse.redirect(url);
}
