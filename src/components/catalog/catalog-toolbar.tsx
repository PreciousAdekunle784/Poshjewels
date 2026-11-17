"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronIcon, CloseIcon } from "@/components/icons";
import { formatNaira } from "@/lib/format";

type Option = { href: string; label: string; active: boolean };

export const PRICE_BUCKETS = [
  { key: "0-25000", label: "Under ₦25,000", min: 0, max: 24999 },
  { key: "25000-40000", label: "₦25,000 – ₦40,000", min: 25000, max: 40000 },
  { key: "40000-60000", label: "₦40,000 – ₦60,000", min: 40000, max: 60000 },
  { key: "60000-", label: "Over ₦60,000", min: 60001, max: undefined },
];

const SORTS: Record<string, string> = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price, low to high",
  "price-desc": "Price, high to low",
  name: "Alphabetical",
};

export function CatalogToolbar({ total, categoryLinks, showCategory = true }: { total: number; categoryLinks: Option[]; showCategory?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [drawer, setDrawer] = useState(false);

  const sort = params.get("sort") ?? "featured";
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";
  const inStock = params.get("stock") === "1";

  function update(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    sp.delete("page");
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const activeBucket = PRICE_BUCKETS.find((b) => String(b.min) === min && String(b.max ?? "") === max)?.key;
  const priceActive = Boolean(min || max);
  const chips: { label: string; clear: Record<string, null> }[] = [];
  if (priceActive) {
    const label = PRICE_BUCKETS.find((b) => b.key === activeBucket)?.label ?? `${min ? formatNaira(Number(min)) : "₦0"} – ${max ? formatNaira(Number(max)) : "any"}`;
    chips.push({ label, clear: { min: null, max: null } });
  }
  if (inStock) chips.push({ label: "In stock", clear: { stock: null } });

  const filters = (
    <>
      {showCategory && (
        <Dropdown label="Category">
          <ul className="grid gap-1">
            {categoryLinks.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className={`block py-1.5 text-[14.5px] hover:underline hover:underline-offset-4 ${c.active ? "font-medium" : "text-stone"}`}>
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </Dropdown>
      )}
      <Dropdown label="Price" active={priceActive}>
        <PriceFilter
          min={min}
          max={max}
          activeBucket={activeBucket}
          onApply={(a, b) => update({ min: a, max: b })}
        />
      </Dropdown>
      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[14px]">
        <input type="checkbox" checked={inStock} onChange={(e) => update({ stock: e.target.checked ? "1" : null })} className="h-4 w-4 accent-espresso" />
        In stock only
      </label>
    </>
  );

  return (
    <div className="border-y border-line">
      <div className="flex min-h-14 items-center justify-between gap-4">
        <div className="hidden items-center gap-7 lg:flex">{filters}</div>
        <button type="button" className="nav-link min-h-11 lg:hidden" onClick={() => setDrawer(true)}>
          Filter {chips.length > 0 && <span className="text-stone">({chips.length})</span>}
        </button>
        <div className="flex items-center gap-5">
          <span className="hidden text-[13.5px] text-stone sm:inline">
            {total} {total === 1 ? "piece" : "pieces"}
          </span>
          <label className="flex items-center gap-2 text-[14px]">
            <span className="text-stone">Sort</span>
            <select value={sort} onChange={(e) => update({ sort: e.target.value === "featured" ? null : e.target.value })} className="cursor-pointer appearance-none bg-transparent pr-1 underline-offset-4 hover:underline focus:outline-none">
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <ChevronIcon size={14} className="-ml-1.5" />
          </label>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pb-4">
          {chips.map((c) => (
            <button key={c.label} type="button" onClick={() => update(c.clear)} className="flex items-center gap-1.5 border border-line bg-paper px-3 py-1.5 text-[13px] hover:border-espresso">
              {c.label} <CloseIcon size={13} />
            </button>
          ))}
          <button type="button" onClick={() => update({ min: null, max: null, stock: null })} className="ml-1 text-[13px] text-stone underline underline-offset-4">
            Clear all
          </button>
        </div>
      )}

      {/* Mobile filter drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-espresso/40" onClick={() => setDrawer(false)} />
          <div role="dialog" aria-modal="true" aria-label="Filters" className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-ivory px-4 pb-8 pt-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="label">Filter</p>
              <button type="button" onClick={() => setDrawer(false)} className="-mr-2 p-2" aria-label="Close filters">
                <CloseIcon />
              </button>
            </div>
            {showCategory && (
              <div className="border-t border-line py-4">
                <p className="label mb-2 text-stone">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categoryLinks.map((c) => (
                    <Link key={c.href} href={c.href} className={`border px-3 py-2 text-[14px] ${c.active ? "border-espresso" : "border-line"}`}>
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="border-t border-line py-4">
              <p className="label mb-2 text-stone">Price</p>
              <PriceFilter
                min={min}
                max={max}
                activeBucket={activeBucket}
                onApply={(a, b) => {
                  update({ min: a, max: b });
                  setDrawer(false);
                }}
              />
            </div>
            <div className="border-t border-line py-4">
              <label className="flex items-center gap-2.5 text-[15px]">
                <input type="checkbox" checked={inStock} onChange={(e) => update({ stock: e.target.checked ? "1" : null })} className="h-4 w-4 accent-espresso" />
                In stock only
              </label>
            </div>
            <button type="button" onClick={() => setDrawer(false)} className="btn btn-solid mt-2 w-full">
              Show {total} {total === 1 ? "piece" : "pieces"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PriceFilter({ min, max, activeBucket, onApply }: { min: string; max: string; activeBucket?: string; onApply: (min: string | null, max: string | null) => void }) {
  const [lo, setLo] = useState(min);
  const [hi, setHi] = useState(max);
  useEffect(() => {
    setLo(min);
    setHi(max);
  }, [min, max]);
  return (
    <div className="grid gap-1">
      {PRICE_BUCKETS.map((b) => (
        <button
          key={b.key}
          type="button"
          onClick={() => (activeBucket === b.key ? onApply(null, null) : onApply(String(b.min), b.max ? String(b.max) : null))}
          className={`flex items-center gap-2.5 py-1.5 text-left text-[14.5px] ${activeBucket === b.key ? "font-medium" : "text-stone hover:text-espresso"}`}
          aria-pressed={activeBucket === b.key}
        >
          <span className={`h-3.5 w-3.5 border ${activeBucket === b.key ? "border-espresso bg-espresso" : "border-stone"}`} aria-hidden />
          {b.label}
        </button>
      ))}
      <form
        className="mt-3 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onApply(lo.replace(/\D/g, "") || null, hi.replace(/\D/g, "") || null);
        }}
      >
        <label className="flex-1">
          <span className="mb-1 block text-[12px] text-stone">Min ₦</span>
          <input inputMode="numeric" value={lo} onChange={(e) => setLo(e.target.value)} className="field !min-h-10 !py-1.5 text-[14px]" />
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-[12px] text-stone">Max ₦</span>
          <input inputMode="numeric" value={hi} onChange={(e) => setHi(e.target.value)} className="field !min-h-10 !py-1.5 text-[14px]" />
        </label>
        <button type="submit" className="btn btn-outline !min-h-10 !px-3">
          Go
        </button>
      </form>
    </div>
  );
}

function Dropdown({ label, active, children }: { label: string; active?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex min-h-11 items-center gap-1.5 text-[14px]" aria-expanded={open}>
        {label}
        {active && <span className="h-1.5 w-1.5 rounded-full bg-champagne" aria-label="(active)" />}
        <ChevronIcon size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="absolute left-0 top-full z-20 mt-1 w-[280px] border border-line bg-ivory p-5 shadow-[0_12px_30px_-12px_rgba(31,24,19,0.25)]">{children}</div>}
    </div>
  );
}
