"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/components/cart/cart-context";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { formatNaira } from "@/lib/format";

export function CartView() {
  const cart = useCart();
  const { ready, refresh } = cart;
  useEffect(() => {
    if (ready) refresh();
  }, [ready, refresh]);

  if (!cart.ready) return <div className="min-h-[40vh]" />;

  if (cart.lines.length === 0) {
    return (
      <div className="py-20">
        {cart.notice && <p className="mb-6 border border-line bg-bone p-4 text-[14px]">{cart.notice}</p>}
        <p className="display text-[30px]">Your bag is empty.</p>
        <p className="mt-3 text-stone">Pieces you add will wait here until you&rsquo;re ready.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/shop" className="btn btn-solid">
            Shop all jewellery
          </Link>
          <Link href="/wishlist" className="btn btn-outline">
            View wishlist
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-8">
        {cart.notice && <p className="mb-6 border border-line bg-bone p-4 text-[14px]">{cart.notice}</p>}
        <div className="hidden grid-cols-[1fr_140px_120px] border-b border-line pb-3 text-[13px] text-stone sm:grid">
          <span>Item</span>
          <span>Quantity</span>
          <span className="text-right">Total</span>
        </div>
        <ul className="divide-y divide-line border-b border-line">
          {cart.lines.map((l) => (
            <li key={l.variantId} className="grid grid-cols-[88px_1fr] gap-4 py-6 sm:grid-cols-[1fr_140px_120px] sm:items-center sm:gap-0">
              <div className="contents sm:flex sm:items-center sm:gap-5">
                <Link href={`/product/${l.slug}`} className="relative row-span-2 aspect-[4/5] w-[88px] overflow-hidden bg-bone sm:w-[96px] sm:shrink-0">
                  {l.image && <Image src={l.image} alt={l.name} fill sizes="96px" className="object-cover" />}
                </Link>
                <div>
                  <Link href={`/product/${l.slug}`} className="hover:underline">
                    {l.name}
                  </Link>
                  {l.variantName && <p className="text-[13px] text-stone">{l.variantName}</p>}
                  <p className="tabular text-[13px] text-stone">{formatNaira(l.price)} each</p>
                  <button onClick={() => cart.remove(l.variantId)} className="mt-2 text-[13px] text-stone underline underline-offset-4 hover:text-espresso">
                    Remove
                  </button>
                </div>
              </div>
              <div className="col-start-2 flex items-center justify-between sm:col-start-auto sm:block">
                <QuantityStepper value={l.quantity} max={l.stock} onChange={(q) => cart.setQuantity(l.variantId, q)} small label={l.name} />
                <span className="tabular sm:hidden">{formatNaira(l.price * l.quantity)}</span>
              </div>
              <span className="tabular hidden text-right sm:block">{formatNaira(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <Link href="/shop" className="link label mt-6 inline-block">
          Continue shopping
        </Link>
      </div>
      <aside className="lg:col-span-4">
        <div className="bg-bone p-6 lg:sticky lg:top-[140px]">
          <h2 className="label">Order summary</h2>
          <dl className="mt-5 grid gap-2 text-[14.5px]">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="tabular">{formatNaira(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-stone">
              <dt>Delivery</dt>
              <dd>Calculated at checkout</dd>
            </div>
          </dl>
          <Link href="/checkout" className="btn btn-solid mt-6 w-full">
            Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
