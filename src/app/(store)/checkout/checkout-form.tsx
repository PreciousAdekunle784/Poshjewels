"use client";

import { keepValues } from "@/lib/form-submit";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { placeOrderAction, type CheckoutState } from "@/app/actions/checkout";
import { useCart } from "@/components/cart/cart-context";
import { formatNaira } from "@/lib/format";
import { NIGERIAN_STATES } from "@/lib/site";

type Method = { id: "paystack" | "bank_transfer"; label: string; note: string };

export function CheckoutForm({
  shipping,
  methods,
  prefill,
}: {
  shipping: { lagosFee: number; otherStatesFee: number; freeShippingThreshold: number };
  methods: Method[];
  prefill: { email: string; name: string } | null;
}) {
  const cart = useCart();
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrderAction, null);
  const [region, setRegion] = useState("");
  const [method, setMethod] = useState<Method["id"] | "">(methods.length === 1 ? methods[0].id : "");
  const { ready, refresh, clear } = cart;

  useEffect(() => {
    if (ready) refresh();
  }, [ready, refresh]);

  useEffect(() => {
    if (state?.ok) {
      clear();
      window.location.assign(state.redirectTo);
    }
  }, [state, clear]);

  const fee = useMemo(() => {
    if (shipping.freeShippingThreshold > 0 && cart.subtotal >= shipping.freeShippingThreshold) return 0;
    if (!region) return null;
    return region === "Lagos" ? shipping.lagosFee : shipping.otherStatesFee;
  }, [region, cart.subtotal, shipping]);

  const errors = state && !state.ok ? state.errors ?? {} : {};
  const [first, ...rest] = (prefill?.name ?? "").split(" ");

  if (!cart.ready) return <div className="min-h-[50vh]" />;
  if (cart.lines.length === 0 && !state?.ok) {
    return (
      <div className="py-12">
        {cart.notice && <p className="mb-6 border border-line bg-bone p-4 text-[14px]">{cart.notice}</p>}
        <p className="display text-[28px]">Your bag is empty.</p>
        <Link href="/shop" className="btn btn-solid mt-8">
          Shop all jewellery
        </Link>
      </div>
    );
  }

  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="field-label">{label}</span>
      <input name={name} className="field" aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-err` : undefined} {...props} />
      {errors[name] && (
        <span id={`${name}-err`} className="mt-1 block text-[13px] text-oxblood">
          {errors[name]}
        </span>
      )}
    </label>
  );

  return (
    <form onSubmit={keepValues(action)} className="grid gap-12 lg:grid-cols-12" noValidate>
      <input type="hidden" name="lines" value={JSON.stringify(cart.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })))} />
      <div className="grid gap-10 lg:col-span-7">
        <fieldset className="grid gap-4">
          <legend className="label mb-4">Contact</legend>
          {field("email", "Email", { type: "email", autoComplete: "email", defaultValue: prefill?.email, required: true })}
          {field("phone", "Phone number", { type: "tel", autoComplete: "tel", placeholder: "080…", required: true })}
          {!prefill && (
            <p className="text-[13px] text-stone">
              Have an account?{" "}
              <Link href="/account/login?next=/checkout" className="underline underline-offset-4">
                Sign in
              </Link>{" "}
              to keep your orders in one place.
            </p>
          )}
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="label mb-4">Delivery</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("firstName", "First name", { autoComplete: "given-name", defaultValue: first || undefined, required: true })}
            {field("lastName", "Last name", { autoComplete: "family-name", defaultValue: rest.join(" ") || undefined, required: true })}
          </div>
          {field("address", "Street address", { autoComplete: "street-address", required: true })}
          <div className="grid gap-4 sm:grid-cols-2">
            {field("city", "City / town", { autoComplete: "address-level2", required: true })}
            <label className="block">
              <span className="field-label">State</span>
              <select name="state" className="field" value={region} onChange={(e) => setRegion(e.target.value)} aria-invalid={!!errors.state} required>
                <option value="">Choose a state</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.state && <span className="mt-1 block text-[13px] text-oxblood">{errors.state}</span>}
            </label>
          </div>
          <label className="block">
            <span className="field-label">Delivery note (optional)</span>
            <textarea name="note" className="field !min-h-[88px]" rows={3} placeholder="Landmark, gate code, gift message…" />
          </label>
        </fieldset>

        <fieldset>
          <legend className="label mb-4">Payment</legend>
          {methods.length === 0 ? (
            <p className="border border-line bg-paper p-4 text-[14px]">Online ordering is paused while payment options are being set up. Please contact us to place an order.</p>
          ) : (
            <div className="grid gap-2">
              {methods.map((m) => (
                <label key={m.id} className={`flex cursor-pointer gap-4 border p-4 transition-colors ${method === m.id ? "border-espresso bg-paper" : "border-line"}`}>
                  <input type="radio" name="paymentMethod" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="mt-1 h-4 w-4 accent-espresso" />
                  <span>
                    <span className="block text-[15px]">{m.label}</span>
                    <span className="block text-[13px] text-stone">{m.note}</span>
                  </span>
                </label>
              ))}
              {errors.paymentMethod && <span className="text-[13px] text-oxblood">{errors.paymentMethod}</span>}
            </div>
          )}
        </fieldset>
      </div>

      <aside className="lg:col-span-5">
        <div className="bg-bone p-6 lg:sticky lg:top-[140px]">
          <h2 className="label">Your order</h2>
          {cart.notice && <p className="mt-4 text-[13px] text-oxblood">{cart.notice}</p>}
          <ul className="mt-5 divide-y divide-espresso/10">
            {cart.lines.map((l) => (
              <li key={l.variantId} className="flex gap-4 py-3">
                <div className="relative h-[72px] w-[58px] shrink-0 overflow-hidden bg-ivory">
                  {l.image && <Image src={l.image} alt="" fill sizes="58px" className="object-cover" />}
                  <span className="tabular absolute right-0 top-0 bg-espresso px-1.5 text-[11px] text-ivory">{l.quantity}</span>
                </div>
                <div className="min-w-0 flex-1 text-[14px]">
                  <p className="leading-snug">{l.name}</p>
                  {l.variantName && <p className="text-[12.5px] text-stone">{l.variantName}</p>}
                </div>
                <span className="tabular text-[14px]">{formatNaira(l.price * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 grid gap-2 border-t border-espresso/15 pt-4 text-[14.5px]">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="tabular">{formatNaira(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd className="tabular">{fee === null ? <span className="text-stone">Choose a state</span> : fee === 0 ? "Free" : formatNaira(fee)}</dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-espresso/15 pt-3 text-[17px]">
              <dt>Total</dt>
              <dd className="tabular">{formatNaira(cart.subtotal + (fee ?? 0))}</dd>
            </div>
          </dl>
          {state && !state.ok && (
            <p className="mt-4 text-[14px] text-oxblood" role="alert">
              {state.message}
            </p>
          )}
          <button type="submit" disabled={pending || methods.length === 0 || state?.ok} className="btn btn-solid mt-6 w-full">
            {pending || state?.ok ? "Placing order…" : method === "paystack" ? "Continue to payment" : "Place order"}
          </button>
          <p className="mt-3 text-center text-[12.5px] text-stone">
            By placing your order you agree to our{" "}
            <Link href="/pages/terms" className="underline underline-offset-2">
              terms
            </Link>
            .
          </p>
        </div>
      </aside>
    </form>
  );
}
