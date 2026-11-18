"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import type { MenuData } from "./header";

/**
 * Mobile navigation — the velvet tray, pocket-sized. The header turns cocoa and the sheet lifts open
 * beneath it, so the wordmark, Close and Bag never move. Categories are a swipeable row of
 * photograph cards (thumb-sized, tactile), followed by edits and quieter links.
 */
export function MobileMenu({ open, menu, onClose, wishlistCount }: { open: boolean; menu: MenuData; onClose: () => void; wishlistCount: number }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const i = (n: number) => ({ "--i": n }) as CSSProperties;
  const edits = menu.collections.filter((c) => c.slug !== "new-arrivals");

  return (
    <div
      id="mobile-menu"
      data-open={open}
      aria-hidden={!open}
      inert={!open}
      className="panel fixed inset-x-0 bottom-0 top-[56px] z-30 overflow-y-auto overscroll-contain bg-cocoa text-ivory lg:hidden"
    >
      <div className="pb-10 pt-6">
        <form
          role="search"
          className="fade mx-4 flex items-center border-b border-ivory/40 focus-within:border-ivory"
          style={i(0)}
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) {
              router.push(`/search?q=${encodeURIComponent(q.trim())}`);
              onClose();
            }
          }}
        >
          <label htmlFor="m-search" className="sr-only">
            Search jewellery
          </label>
          <input
            id="m-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the collection"
            className="h-12 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-ivory/50"
            enterKeyHint="search"
          />
          <button className="text-[14px] font-medium">Search</button>
        </form>

        <p className="mx-4 mt-8">
          <span className="rise" style={i(1)}>
            <span className="label text-ivory/55">Shop by category</span>
          </span>
        </p>
        <ul className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4">
          {menu.categories.map((c, n) => (
            <li key={c.slug} className="rise w-[44%] shrink-0 snap-start" style={i(n + 2)}>
              <span>
                <Link href={`/shop/${c.slug}`} className="block active:opacity-80">
                  <span className="relative block aspect-[3/4] overflow-hidden bg-espresso">
                    {c.imageUrl && <Image src={c.imageUrl} alt="" fill sizes="44vw" className="object-cover" />}
                  </span>
                  <span className="mt-2.5 flex items-baseline justify-between gap-2">
                    <span className="display text-[27px] leading-none">{c.name}</span>
                    <span className="tabular text-[12.5px] text-ivory/55">{c.count}</span>
                  </span>
                </Link>
              </span>
            </li>
          ))}
        </ul>

        <div className="fade mx-4 mt-6 flex items-center justify-between" style={i(8)}>
          <Link href="/shop" className="cta-link">
            <span>All pieces</span>
            <span className="arrow" aria-hidden />
          </Link>
          <Link href="/collections/new-arrivals" className="cta-link">
            <span>New arrivals</span>
            <span className="arrow" aria-hidden />
          </Link>
        </div>

        {edits.length > 0 && (
          <div className="fade mt-9" style={i(9)}>
            <p className="label mx-4 text-ivory/55">Edits</p>
            <ul className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4">
              {edits.map((c) => (
                <li key={c.slug} className="shrink-0">
                  <Link href={`/collections/${c.slug}`} className="block border border-ivory/30 px-4 py-2.5 text-[14.5px] active:border-ivory">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="fade mx-4 mt-9 grid grid-cols-2 gap-x-6 gap-y-3.5 border-t border-ivory/15 pt-6 text-[15px] text-ivory/80" style={i(10)}>
          <Link href="/account">Account</Link>
          <Link href="/wishlist">Wishlist{wishlistCount > 0 && <sup className="tabular ml-0.5 text-[10.5px] text-ivory/55">{wishlistCount}</sup>}</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/pages/shipping">Delivery</Link>
        </div>
      </div>
    </div>
  );
}
