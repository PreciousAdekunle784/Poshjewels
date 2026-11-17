import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { paystackEnabled } from "@/lib/paystack";
import { getSettings } from "@/lib/settings";
import { CheckoutForm } from "./checkout-form";
import { isTemporaryStorage } from "@/db/config";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const [settings, session] = await Promise.all([getSettings(["shipping", "bank"]), getSession()]);
  const methods = [
    paystackEnabled() && { id: "paystack" as const, label: "Card, bank or USSD", note: "Pay securely with Paystack. You'll be taken to Paystack to complete payment." },
    settings.bank.enabled && { id: "bank_transfer" as const, label: "Direct bank transfer", note: "Transfer the total after placing your order. Bank details are shown on the next page." },
  ].filter(Boolean) as { id: "paystack" | "bank_transfer"; label: string; note: string }[];

  return (
    <div className="wrap pb-24">
      <h1 className="display t-title pb-8 pt-10 lg:pt-14">Checkout</h1>
      {isTemporaryStorage && (
        <p className="mb-8 border-l-2 border-champagne pl-3 text-[13.5px] text-stone">
          This is a preview of the store. Orders placed here are for testing and are not kept.
        </p>
      )}
      <CheckoutForm
        shipping={{ lagosFee: settings.shipping.lagosFee, otherStatesFee: settings.shipping.otherStatesFee, freeShippingThreshold: settings.shipping.freeShippingThreshold }}
        methods={methods}
        prefill={session ? { email: session.email, name: session.name } : null}
      />
    </div>
  );
}
