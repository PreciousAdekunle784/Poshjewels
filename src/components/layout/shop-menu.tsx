"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { CtaLink } from "@/components/ui/cta";
import { formatNaira } from "@/lib/format";
import type { MenuData } from "./header";

/**
 * The Shop menu — "the velvet tray". The header and panel turn deep cocoa, like jewellery laid out
 * on a dark display tray. Category names are set large in ivory; the photograph wipes across to
 * follow whichever name is hovered or focused, and three pieces from that category sit beneath it
 * as a direct way in.
 */
export function ShopMenu({ open, menu, onClose }: { open: boolean; menu: MenuData; onClose: () => void }) {
  const [active, setActive] = useState(0);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const cat = menu.categories[active];

  useEffect(() => {
    if (!open) return;
    setActive(0);
    const t = setTimeout(() => links.current[0]?.focus({ preventScroll: true }), 160);
    return () => clearTimeout(t);
  }, [open]);

  // Up/down arrows move through the category names.
  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const n = menu.categories.length;
    const next = (active + (e.key === "ArrowDown" ? 1 : -1) + n) % n;
    links.current[next]?.focus();
  };

  const i = (n: number) => ({ "--i": n }) as CSSProperties;
  const quietLink = "text-ivory/75 transition-colors hover:text-ivory";

  return (
    <div
      id="shop-menu"
      data-open={open}
      aria-hidden={!open}
      inert={!open}
      className="panel fixed inset-x-0 bottom-0 top-[56px] z-30 hidden overflow-y-auto bg-cocoa text-ivory lg:top-[64px] lg:block"
    >
      <div className="wrap grid min-h-full grid-cols-12 gap-x-8 pb-10 pt-10">
        <nav aria-label="Shop" className="col-span-6 flex flex-col">
          <span className="rise" style={i(0)}>
            <span className="label text-ivory/55">Shop by category</span>
          </span>

          <ul className="menu-cats mt-5" onKeyDown={onKeyDown}>
            {menu.categories.map((c, n) => (
              <li key={c.slug} className="rise" style={i(n + 1)}>
                <span>
                  <Link
                    ref={(el) => {
                      links.current[n] = el;
                    }}
                    href={`/shop/${c.slug}`}
                    onMouseEnter={() => setActive(n)}
                    onFocus={() => setActive(n)}
                    data-active={n === active}
                    className="menu-cat display flex items-center gap-4 py-[0.1em] text-[clamp(48px,5.6vw,88px)] leading-[1.02]"
                  >
                    <span className="facet !h-2 !w-2 text-champagne" aria-hidden />
                    <span>{c.name}</span>
                    <span className="self-start pt-[0.55em] font-sans text-[13px] tabular text-ivory/50">{c.count}</span>
                  </Link>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-auto grid grid-cols-3 gap-8 border-t border-ivory/15 pt-6 text-[14.5px]">
            <div className="fade" style={i(8)}>
              <p className="label mb-3 text-ivory/50">Browse</p>
              <ul className="grid gap-1.5">
                <li>
                  <Link href="/shop" className={quietLink}>
                    All pieces
                  </Link>
                </li>
                <li>
                  <Link href="/collections/new-arrivals" className={quietLink}>
                    New arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/wishlist" className={quietLink}>
                    Your wishlist
                  </Link>
                </li>
              </ul>
            </div>
            <div className="fade" style={i(9)}>
              <p className="label mb-3 text-ivory/50">Edits</p>
              <ul className="grid gap-1.5">
                {menu.collections
                  .filter((c) => c.slug !== "new-arrivals")
                  .map((c) => (
                    <li key={c.slug}>
                      <Link href={`/collections/${c.slug}`} className={quietLink}>
                        {c.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="fade" style={i(10)}>
              <p className="label mb-3 text-ivory/50">Help</p>
              <ul className="grid gap-1.5">
                <li>
                  <Link href="/contact" className={quietLink}>
                    Contact us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className={quietLink}>
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/pages/shipping" className={quietLink}>
                    Delivery
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="col-span-5 col-start-8 flex flex-col">
          <div className="menu-figure relative min-h-[300px] flex-1 overflow-hidden bg-espresso">
            {menu.categories.map((c, n) =>
              c.imageUrl ? (
                <div key={c.slug} className="menu-img absolute inset-0 overflow-hidden" data-active={n === active}>
                  <Image src={c.imageUrl} alt="" fill sizes="40vw" className="object-cover" />
                </div>
              ) : null,
            )}
          </div>
          {cat && (
            <div className="fade mt-5" style={i(6)}>
              <div className="flex items-end justify-between gap-8">
                <p className="max-w-[36ch] text-[14.5px] leading-relaxed text-ivory/70">{cat.description}</p>
                <CtaLink href={`/shop/${cat.slug}`} className="text-ivory">
                  Shop all {cat.name.toLowerCase()}
                </CtaLink>
              </div>
              {cat.pieces.length > 0 && (
                <ul key={cat.slug} className="menu-peek mt-5 grid grid-cols-3 gap-3 border-t border-ivory/15 pt-5">
                  {cat.pieces.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/product/${p.slug}`} className="group flex items-center gap-3">
                        <span className="relative h-[60px] w-12 shrink-0 overflow-hidden bg-espresso">
                          {p.image && <Image src={p.image} alt="" fill sizes="48px" className="object-cover" />}
                        </span>
                        <span className="min-w-0 text-[13px] leading-snug">
                          <span className="block truncate group-hover:underline group-hover:underline-offset-4">{p.name}</span>
                          <span className="tabular text-ivory/55">{formatNaira(p.price)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
