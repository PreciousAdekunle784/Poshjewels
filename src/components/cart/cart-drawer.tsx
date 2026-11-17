"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "./cart-context";
import { formatNaira } from "@/lib/format";
import { CloseIcon } from "@/components/icons";
import { QuantityStepper } from "./quantity-stepper";

export function CartDrawer() {
  const cart = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { isOpen, close, refresh } = cart;

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!isOpen) return;
    refresh();
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [isOpen, close, refresh]);

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <div
        className={`absolute inset-0 bg-espresso/40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        tabIndex={-1}
        className={`absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-ivory outline-none transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="label">Your bag {cart.count > 0 && <span className="text-stone">({cart.count})</span>}</p>
          <button onClick={close} className="-mr-2 p-2" aria-label="Close bag">
            <CloseIcon />
          </button>
        </div>

        {cart.notice && <p className="border-b border-line bg-bone px-6 py-3 text-[13px]">{cart.notice}</p>}

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-5 px-6">
            <p className="display text-3xl">Your bag is empty.</p>
            <p className="text-stone">Start with something you&rsquo;ll wear every day.</p>
            <Link href="/shop" className="btn btn-solid" onClick={close}>
              Shop all jewellery
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {cart.lines.map((l) => (
                <li key={l.variantId} className="flex gap-4 py-5">
                  <Link href={`/product/${l.slug}`} onClick={close} className="relative h-[104px] w-[84px] shrink-0 overflow-hidden bg-bone">
                    {l.image && <Image src={l.image} alt={l.name} fill sizes="84px" className="object-cover" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link href={`/product/${l.slug}`} onClick={close} className="leading-snug hover:underline">
                        {l.name}
                      </Link>
                      <span className="tabular shrink-0">{formatNaira(l.price * l.quantity)}</span>
                    </div>
                    {l.variantName && <p className="mt-0.5 text-[13px] text-stone">{l.variantName}</p>}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QuantityStepper value={l.quantity} max={l.stock} onChange={(q) => cart.setQuantity(l.variantId, q)} small label={l.name} />
                      <button onClick={() => cart.remove(l.variantId)} className="text-[13px] text-stone underline-offset-4 hover:text-espresso hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-6 pb-6 pt-5">
              <div className="flex items-baseline justify-between">
                <span>Subtotal</span>
                <span className="tabular text-lg">{formatNaira(cart.subtotal)}</span>
              </div>
              <p className="mt-1 text-[13px] text-stone">Delivery is calculated at checkout.</p>
              <div className="mt-5 grid gap-2">
                <Link href="/checkout" className="btn btn-solid w-full" onClick={close}>
                  Checkout
                </Link>
                <Link href="/cart" className="btn btn-outline w-full" onClick={close}>
                  View bag
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
