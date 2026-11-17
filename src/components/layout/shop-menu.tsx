"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CtaLink } from "@/components/ui/cta";
import type { MenuData } from "./header";

/**
 * The editorial Shop menu. Category names are set large on the left; the photograph on the right
 * follows whichever name is hovered or focused, like turning the pages of a lookbook.
 */
export function ShopMenu({ open, top, menu, onClose }: { open: boolean; top: number; menu: MenuData; onClose: () => void }) {
  const [active, setActive] = useState(0);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const cat = menu.categories[active];

  useEffect(() => {
    if (!open) return;
    setActive(0);
    const t = setTimeout(() => firstLink.current?.focus({ preventScroll: true }), 120);
    return () => clearTimeout(t);
  }, [open]);

  const i = (n: number) => ({ "--i": n }) as CSSProperties;

  return (
    <div
      id="shop-menu"
      data-open={open}
      aria-hidden={!open}
      inert={!open}
      className="panel fixed inset-x-0 bottom-0 z-30 hidden overflow-y-auto bg-ivory lg:block"
      style={{ top }}
    >
      <div className="wrap grid min-h-full grid-cols-12 gap-x-8 pb-10 pt-9">
        <nav aria-label="Shop" className="col-span-6 flex flex-col">
          <div className="flex items-baseline justify-between">
            <span className="rise" style={i(0)}>
              <span className="label text-stone">Shop by category</span>
            </span>
          </div>

          <ul className="menu-cats mt-5">
            {menu.categories.map((c, n) => (
              <li key={c.slug} className="rise" style={i(n + 1)}>
                <span>
                <Link
                  ref={n === 0 ? firstLink : undefined}
                  href={`/shop/${c.slug}`}
                  onMouseEnter={() => setActive(n)}
                  onFocus={() => setActive(n)}
                  data-active={n === active}
                  className="menu-cat display flex items-center gap-4 py-[0.12em] text-[clamp(46px,5.4vw,84px)] leading-[1.02]"
                >
                  <span className="facet !h-2 !w-2 text-champagne" aria-hidden />
                  <span>{c.name}</span>
                  <span className="t-price self-start pt-[0.5em] font-sans text-[13px]">{c.count}</span>
                </Link>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-auto grid grid-cols-3 gap-8 border-t border-line pt-6 text-[14.5px]">
            <div className="fade" style={i(8)}>
              <p className="label mb-3 text-stone">Browse</p>
              <ul className="grid gap-1.5">
                <li>
                  <Link href="/shop" className="hover:underline hover:underline-offset-4">
                    All pieces
                  </Link>
                </li>
                <li>
                  <Link href="/collections/new-arrivals" className="hover:underline hover:underline-offset-4">
                    New arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/wishlist" className="hover:underline hover:underline-offset-4">
                    Your wishlist
                  </Link>
                </li>
              </ul>
            </div>
            <div className="fade" style={i(9)}>
              <p className="label mb-3 text-stone">Edits</p>
              <ul className="grid gap-1.5">
                {menu.collections
                  .filter((c) => c.slug !== "new-arrivals")
                  .map((c) => (
                    <li key={c.slug}>
                      <Link href={`/collections/${c.slug}`} className="hover:underline hover:underline-offset-4">
                        {c.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="fade" style={i(10)}>
              <p className="label mb-3 text-stone">Help</p>
              <ul className="grid gap-1.5">
                <li>
                  <Link href="/contact" className="hover:underline hover:underline-offset-4">
                    Contact us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:underline hover:underline-offset-4">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/pages/shipping" className="hover:underline hover:underline-offset-4">
                    Delivery
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="col-span-5 col-start-8 flex flex-col">
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="cta-link fade text-stone hover:text-espresso" style={i(2)}>
              Close
            </button>
          </div>
          <div className="menu-figure relative mt-4 min-h-[340px] flex-1 overflow-hidden bg-bone">
            {menu.categories.map((c, n) =>
              c.imageUrl ? (
                <div key={c.slug} className="menu-img absolute inset-0" data-active={n === active}>
                  <Image src={c.imageUrl} alt="" fill sizes="40vw" className="object-cover" />
                </div>
              ) : null,
            )}
          </div>
          {cat && (
            <div className="fade mt-5 flex items-end justify-between gap-8" style={i(6)}>
              <p className="max-w-[38ch] text-[14.5px] leading-relaxed text-stone">{cat.description}</p>
              <CtaLink href={`/shop/${cat.slug}`}>Shop {cat.name.toLowerCase()}</CtaLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
