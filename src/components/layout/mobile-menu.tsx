"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import type { MenuData } from "./header";

/**
 * Mobile navigation: a sheet that lifts open under the header, so the wordmark, Close and Bag
 * stay exactly where they were. Categories are rows with a small photograph — easy to scan and tap.
 */
export function MobileMenu({ open, top, menu, onClose, wishlistCount }: { open: boolean; top: number; menu: MenuData; onClose: () => void; wishlistCount: number }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const i = (n: number) => ({ "--i": n }) as CSSProperties;

  return (
    <div id="mobile-menu" data-open={open} aria-hidden={!open} inert={!open} className="panel fixed inset-x-0 bottom-0 z-30 overflow-y-auto overscroll-contain bg-ivory lg:hidden" style={{ top }}>
      <div className="wrap pb-10 pt-5">
        <form
          role="search"
          className="fade flex items-center border-b border-espresso/50 focus-within:border-espresso"
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
            className="h-12 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-stone"
            enterKeyHint="search"
          />
          <button className="text-[14px] font-medium">Search</button>
        </form>

        <p className="label mt-8 text-stone">
          <span className="rise" style={i(1)}>
            <span>Shop by category</span>
          </span>
        </p>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {menu.categories.map((c, n) => (
            <li key={c.slug} className="rise" style={i(n + 2)}>
              <Link href={`/shop/${c.slug}`} className="flex items-center gap-4 py-2.5 active:bg-bone">
                <span className="relative h-[60px] w-12 shrink-0 overflow-hidden bg-bone">
                  {c.imageUrl && <Image src={c.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
                </span>
                <span className="display flex-1 text-[30px] leading-none">{c.name}</span>
                <span className="t-price text-[13px]">{c.count}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="fade mt-4 flex items-center justify-between" style={i(8)}>
          <Link href="/shop" className="cta-link">
            <span>All pieces</span>
            <span className="arrow" aria-hidden />
          </Link>
          <Link href="/collections/new-arrivals" className="cta-link">
            <span>New arrivals</span>
            <span className="arrow" aria-hidden />
          </Link>
        </div>

        {menu.collections.filter((c) => c.slug !== "new-arrivals").length > 0 && (
          <div className="fade mt-9" style={i(9)}>
            <p className="label text-stone">Edits</p>
            <ul className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
              {menu.collections
                .filter((c) => c.slug !== "new-arrivals")
                .map((c) => (
                  <li key={c.slug} className="shrink-0">
                    <Link href={`/collections/${c.slug}`} className="block border border-line px-4 py-2.5 text-[14.5px] active:border-espresso">
                      {c.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <div className="fade mt-9 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-6 text-[15px]" style={i(10)}>
          <Link href="/account">Account</Link>
          <Link href="/wishlist">Wishlist{wishlistCount > 0 && <sup className="tabular ml-0.5 text-[10.5px] text-stone">{wishlistCount}</sup>}</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/pages/shipping">Delivery</Link>
        </div>
      </div>
    </div>
  );
}
