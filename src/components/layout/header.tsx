"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MAIN_NAV } from "@/lib/nav";
import { useCart } from "@/components/cart/cart-context";
import { useWishlist } from "@/components/cart/wishlist-context";
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from "@/components/icons";
import { SearchPanel } from "./search-panel";
import { Wordmark } from "./wordmark";

export function Header() {
  const pathname = usePathname();
  const cart = useCart();
  const wishlist = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const isActive = (href: string) => (href === "/" || href === "/shop" ? pathname === href : pathname === href || pathname.startsWith(href + "/"));

  return (
    <>
      <header className={`sticky top-0 z-40 bg-ivory transition-[border-color] ${scrolled ? "border-b border-line" : "border-b border-transparent"}`}>
        <div className="wrap grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:h-[76px]">
          <div className="flex items-center gap-1 lg:gap-5">
            <button className="-ml-2 p-2 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
              <MenuIcon size={22} />
            </button>
            <button className="flex items-center gap-2 p-2 lg:-ml-2" onClick={() => setSearchOpen(true)} aria-label="Search">
              <SearchIcon />
              <span className="label hidden lg:inline">Search</span>
            </button>
          </div>

          <Link href="/" aria-label="Posh Jewel — home" className="justify-self-center">
            <Wordmark className="text-[19px] sm:text-[22px] lg:text-[26px]" />
          </Link>

          <div className="flex items-center justify-end gap-0.5 sm:gap-2">
            <Link href="/account" className="hidden p-2 sm:block" aria-label="Account">
              <UserIcon />
            </Link>
            <Link href="/wishlist" className="relative hidden p-2 sm:block" aria-label={`Wishlist${wishlist.ids.length ? `, ${wishlist.ids.length} items` : ""}`}>
              <HeartIcon />
              {wishlist.ids.length > 0 && <span className="absolute right-1 top-1.5 h-1.5 w-1.5 rounded-full bg-champagne" aria-hidden />}
            </Link>
            <button onClick={cart.open} className="relative -mr-2 flex items-center gap-1.5 p-2" aria-label={`Open bag, ${cart.count} items`}>
              <BagIcon />
              <span className="tabular min-w-[1ch] text-[13px]" aria-hidden>
                {cart.ready && cart.count > 0 ? cart.count : ""}
              </span>
            </button>
          </div>
        </div>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="wrap flex h-11 items-center justify-center gap-9">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`label relative py-1 transition-colors hover:text-espresso ${isActive(item.href) ? "text-espresso after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-espresso" : "text-stone"}`}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-50 lg:hidden ${menuOpen ? "" : "pointer-events-none"}`} aria-hidden={!menuOpen}>
        <div className={`absolute inset-0 bg-espresso/40 transition-opacity ${menuOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setMenuOpen(false)} />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute left-0 top-0 flex h-full w-[86%] max-w-[380px] flex-col bg-ivory transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-16 items-center justify-between border-b border-line px-4">
            <Wordmark className="text-[19px]" />
            <button className="-mr-2 p-2" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <CloseIcon size={22} />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-4">
            <ul>
              {MAIN_NAV.map((item) => (
                <li key={item.href} className="border-b border-line/70">
                  <Link href={item.href} className={`display block py-3.5 text-[24px] ${isActive(item.href) ? "italic" : ""}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-6 grid gap-1 text-[15px]">
              <li>
                <Link href="/account" className="flex items-center gap-3 py-2">
                  <UserIcon /> Account
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="flex items-center gap-3 py-2">
                  <HeartIcon /> Wishlist {wishlist.ids.length > 0 && <span className="text-stone">({wishlist.ids.length})</span>}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
