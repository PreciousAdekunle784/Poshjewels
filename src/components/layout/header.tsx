"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { useWishlist } from "@/components/cart/wishlist-context";
import { ShopMenu } from "./shop-menu";
import { MobileMenu } from "./mobile-menu";
import { SearchPanel } from "./search-panel";
import { Wordmark } from "./wordmark";

export type MenuPiece = { slug: string; name: string; price: number; image: string | null };
export type MenuData = {
  categories: { slug: string; name: string; description: string | null; imageUrl: string | null; count: number; pieces: MenuPiece[] }[];
  collections: { slug: string; name: string }[];
};

type Panel = "shop" | "mobile" | "search" | null;

const PRIMARY = [
  { href: "/collections/new-arrivals", label: "New in" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
];

export function Header({ menu }: { menu: MenuData }) {
  const pathname = usePathname();
  const cart = useCart();
  const wishlist = useWishlist();
  const headerRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const shopBtnRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const [compact, setCompact] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const variant = pathname === "/" ? "cover" : "standard";

  // Compact flag: the sentinel sits at the very top of the header and leaves the viewport once the
  // masthead has folded under the sticky offset. One observer, no scroll listener.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setCompact(!entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const close = useCallback(() => {
    setPanel((current) => {
      if (current === "shop") shopBtnRef.current?.focus();
      if (current === "mobile") menuBtnRef.current?.focus();
      return null;
    });
  }, []);

  // Panels open directly under the folded bar, so fold the masthead first if the page is at the top.
  const foldMasthead = () => {
    const header = headerRef.current;
    if (!header) return;
    const strip = window.innerWidth >= 1024 ? 64 : 56;
    const foldY = header.offsetTop + header.offsetHeight - strip;
    if (window.scrollY < foldY - 1) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: foldY, behavior: reduce ? "instant" : "smooth" });
    }
  };

  const toggle = (p: Exclude<Panel, null>) => {
    if (panel === p) {
      setPanel(null);
      return;
    }
    foldMasthead();
    setPanel(p);
  };

  useEffect(() => {
    setPanel(null);
  }, [pathname]);

  useLayoutEffect(() => {
    if (!panel) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    // Let the fold scroll finish before locking the page.
    const lock = window.setTimeout(() => (root.style.overflow = "hidden"), 450);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(lock);
      root.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [panel, close]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const shopActive = pathname === "/shop" || pathname.startsWith("/shop/") || pathname.startsWith("/product/");
  const count = cart.ready ? cart.count : 0;
  const tray = panel === "shop" || panel === "mobile";

  return (
    <>
      <header
        ref={headerRef}
        data-variant={variant}
        data-compact={compact || panel !== null}
        data-tray={tray}
        className="masthead sticky z-40 bg-ivory text-espresso"
        style={{ viewTransitionName: "site-header" }}
      >
        <span ref={sentinelRef} className="pointer-events-none absolute left-0 top-0 h-px w-px" aria-hidden />
        <div className="masthead-bar wrap relative flex items-end justify-between gap-6 pb-[13px] lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-6 lg:pb-[17px]">
          <Link href="/" aria-label="Posh Jewel, home" className="masthead-mark block leading-none lg:col-span-4" onClick={() => setPanel(null)}>
            <Wordmark />
          </Link>

          {/* Desktop: the shop trigger leads a short primary list, set off-centre beside the masthead. */}
          <nav aria-label="Main" className="hidden lg:col-span-4 lg:col-start-6 lg:block">
            <ul className="flex items-center gap-8">
              <li>
                <button
                  ref={shopBtnRef}
                  type="button"
                  className="nav-link"
                  aria-expanded={panel === "shop"}
                  aria-controls="shop-menu"
                  aria-current={shopActive ? "page" : undefined}
                  onClick={() => toggle("shop")}
                >
                  <span className="facet" aria-hidden />
                  {panel === "shop" ? "Close" : "Shop"}
                </button>
              </li>
              {PRIMARY.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="nav-link" aria-current={isActive(item.href) ? "page" : undefined}>
                    <span className="facet" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Utilities are words, not icons, set quieter than the primary list. */}
          <ul className="flex items-center gap-5 lg:col-span-3 lg:justify-end lg:gap-6">
            <li className="hidden lg:block">
              <button type="button" className="nav-link nav-quiet" aria-expanded={panel === "search"} onClick={() => toggle("search")}>
                Search
              </button>
            </li>
            <li className="hidden lg:block">
              <Link href="/account" className="nav-link nav-quiet">
                Account
              </Link>
            </li>
            <li className="hidden lg:block">
              <Link href="/wishlist" className="nav-link nav-quiet">
                Wishlist
                {wishlist.ready && wishlist.ids.length > 0 && <sup className="tabular -ml-1 text-[10.5px]">{wishlist.ids.length}</sup>}
              </Link>
            </li>
            <li className="lg:hidden">
              <button ref={menuBtnRef} type="button" className="nav-link w-[3.3rem]" aria-expanded={panel === "mobile"} aria-controls="mobile-menu" onClick={() => toggle("mobile")}>
                {panel === "mobile" ? "Close" : "Menu"}
              </button>
            </li>
            <li>
              <button type="button" className="nav-link" onClick={() => (setPanel(null), cart.open())} aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}>
                Bag
                <sup className="tabular -ml-1 min-w-[1ch] text-[10.5px]" aria-hidden>
                  {count > 0 ? count : ""}
                </sup>
              </button>
            </li>
          </ul>
        </div>
        <span className="masthead-rule absolute inset-x-0 bottom-0 h-px bg-line" aria-hidden />
      </header>

      <ShopMenu open={panel === "shop"} menu={menu} onClose={close} />
      <MobileMenu open={panel === "mobile"} menu={menu} onClose={close} wishlistCount={wishlist.ready ? wishlist.ids.length : 0} />
      <SearchPanel open={panel === "search"} onClose={close} />
    </>
  );
}
