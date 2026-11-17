"use client";

import { useRef } from "react";
import type { ProductCardData } from "@/lib/catalog";
import { ProductCard } from "@/components/product/product-card";
import { ArrowIcon } from "@/components/icons";
import { SectionHeadingClient } from "./section-heading-client";

/** Horizontally scrolling row with snap points. Used for best sellers so it reads differently from the new-arrivals grid. */
export function ProductRail({ products, id, title, copy }: { products: ProductCardData[]; id: string; title: string; copy?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <>
      <SectionHeadingClient id={id} title={title} copy={copy}>
        <div className="mb-1 hidden shrink-0 gap-1 lg:flex">
          <button type="button" onClick={() => scroll(-1)} className="flex h-10 w-10 items-center justify-center border border-line hover:border-espresso" aria-label="Previous products">
            <ArrowIcon size={16} className="rotate-180" />
          </button>
          <button type="button" onClick={() => scroll(1)} className="flex h-10 w-10 items-center justify-center border border-line hover:border-espresso" aria-label="Next products">
            <ArrowIcon size={16} />
          </button>
        </div>
      </SectionHeadingClient>
      <ul
        ref={ref}
        aria-labelledby={id}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:gap-5 lg:scroll-px-0 lg:px-0"
      >
        {products.map((p) => (
          <li key={p.id} className="w-[68%] shrink-0 snap-start sm:w-[40%] lg:w-[calc((100%-3*1.25rem)/4)]">
            <ProductCard product={p} sizes="(min-width:1024px) 23vw, (min-width:640px) 40vw, 68vw" />
          </li>
        ))}
      </ul>
    </>
  );
}
