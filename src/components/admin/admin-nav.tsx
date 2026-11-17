"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MenuIcon, CloseIcon } from "@/components/icons";

const GROUPS = [
  { title: null, links: [["/admin", "Overview"]] },
  { title: "Shop", links: [["/admin/orders", "Orders"], ["/admin/products", "Products"], ["/admin/categories", "Categories"], ["/admin/collections", "Collections"]] },
  { title: "Content", links: [["/admin/homepage", "Homepage"], ["/admin/settings", "Store settings"], ["/admin/pages", "Pages & policies"], ["/admin/faqs", "FAQ"], ["/admin/reviews", "Reviews"]] },
  { title: "Customers", links: [["/admin/messages", "Messages"], ["/admin/subscribers", "Newsletter"]] },
] as const;

export function AdminNav({ badges, variant }: { badges: Record<string, number>; variant: "mobile" | "desktop" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const nav = (
    <nav className="grid gap-6 text-[14px]">
      {GROUPS.map((g, i) => (
        <div key={i}>
          {g.title && <p className="label mb-2 text-[10.5px] text-stone">{g.title}</p>}
          <ul className="grid gap-0.5">
            {g.links.map(([href, label]) => (
              <li key={href}>
                <Link href={href} onClick={() => setOpen(false)} className={`flex items-center justify-between px-3 py-2 ${active(href) ? "bg-espresso text-ivory" : "hover:bg-bone"}`}>
                  {label}
                  {badges[href] ? <span className={`tabular min-w-5 px-1.5 text-center text-[11px] ${active(href) ? "bg-ivory text-espresso" : "bg-champagne text-ivory"}`}>{badges[href]}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
  if (variant === "desktop") return nav;
  return (
    <>
      <div className="lg:hidden">
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 p-2" aria-label="Open admin menu">
          <MenuIcon /> <span className="text-[14px]">Menu</span>
        </button>
        {open && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-espresso/40" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-[270px] overflow-y-auto bg-paper p-5">
              <button onClick={() => setOpen(false)} className="mb-4 p-1" aria-label="Close menu">
                <CloseIcon />
              </button>
              {nav}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
