"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ProductCardData } from "@/lib/catalog";
import { formatNaira } from "@/lib/format";
import { useCart } from "@/components/cart/cart-context";
import { useWishlist } from "@/components/cart/wishlist-context";
import { BagIcon, CloseIcon, HeartIcon } from "@/components/icons";

export function ProductCard({ product, sizes, priority }: { product: ProductCardData; sizes?: string; priority?: boolean }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const [choosing, setChoosing] = useState(false);
  const chooserRef = useRef<HTMLDivElement>(null);
  const href = `/product/${product.slug}`;
  const [first, second] = product.images;
  const hasChoice = product.variants.length > 1;
  const saved = wishlist.ready && wishlist.has(product.id);

  useEffect(() => {
    if (!choosing) return;
    chooserRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setChoosing(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [choosing]);

  function addVariant(v: ProductCardData["variants"][number]) {
    cart.add({
      variantId: v.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantName: product.variants.length > 1 || v.name !== "Default" ? v.name : null,
      price: v.price,
      image: first?.url ?? null,
      stock: v.stock,
    });
    setChoosing(false);
  }

  function quickAdd() {
    if (!product.inStock) return;
    if (hasChoice) setChoosing(true);
    else addVariant(product.variants[0]);
  }

  const status = !product.inStock ? "Sold out" : product.compareAtPrice ? "Sale" : product.label;

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-bone">
        <Link href={href} aria-label={product.name} className="absolute inset-0">
          {first && (
            <Image
              src={first.url}
              alt={first.alt}
              fill
              sizes={sizes ?? "(min-width:1024px) 23vw, (min-width:640px) 31vw, 46vw"}
              className={`object-cover transition-opacity duration-500 ${second ? "group-hover:opacity-0" : ""}`}
              priority={priority}
            />
          )}
          {second && <Image src={second.url} alt="" fill sizes={sizes ?? "(min-width:1024px) 23vw, 46vw"} className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />}
        </Link>

        {status && (
          <span className={`label pointer-events-none absolute left-0 top-3 px-2.5 py-1.5 text-[10px] ${status === "Sold out" ? "bg-paper text-stone" : "bg-ivory text-espresso"}`}>
            {status}
          </span>
        )}

        <button
          type="button"
          onClick={() => wishlist.toggle(product.id)}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center bg-ivory/85 text-espresso transition-colors hover:bg-ivory"
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={saved}
        >
          <HeartIcon size={17} filled={saved} />
        </button>

        {/* Quick add: a bar on hover for pointers, an always-visible icon button on touch. */}
        {product.inStock && !choosing && (
          <>
            <button
              type="button"
              onClick={quickAdd}
              className="label absolute inset-x-3 bottom-3 hidden h-11 translate-y-2 items-center justify-center bg-ivory/95 opacity-0 transition duration-200 hover:bg-espresso hover:text-ivory focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:hover)]:flex"
            >
              {hasChoice ? "Quick add" : "Add to bag"}
            </button>
            <button
              type="button"
              onClick={quickAdd}
              className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center bg-ivory/95 [@media(hover:hover)]:hidden"
              aria-label={`Add ${product.name} to bag`}
            >
              <BagIcon size={18} />
            </button>
          </>
        )}

        {choosing && (
          <div ref={chooserRef} className="absolute inset-x-0 bottom-0 bg-ivory p-3" role="group" aria-label={`Choose an option for ${product.name}`}>
            <div className="mb-2 flex items-center justify-between">
              <span className="label text-[10.5px] text-stone">Choose option</span>
              <button type="button" onClick={() => setChoosing(false)} aria-label="Close options" className="-m-1 p-1">
                <CloseIcon size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  disabled={v.stock <= 0}
                  onClick={() => addVariant(v)}
                  className="min-h-9 border border-line px-3 text-[13px] hover:border-espresso disabled:text-stone/60 disabled:line-through"
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-0.5 pr-1">
        <h3 className="text-[14.5px] leading-snug">
          <Link href={href} className="hover:underline hover:underline-offset-4">
            {product.name}
          </Link>
        </h3>
        <p className="tabular text-[14px]">
          {product.compareAtPrice ? (
            <>
              <span className="text-oxblood">{formatNaira(product.price)}</span>
              <s className="ml-2 text-stone">{formatNaira(product.compareAtPrice)}</s>
            </>
          ) : (
            <span className="text-stone">{hasPriceRange(product) ? `From ${formatNaira(minPrice(product))}` : formatNaira(product.price)}</span>
          )}
        </p>
      </div>
    </article>
  );
}

function minPrice(p: ProductCardData) {
  return p.variants.length ? Math.min(...p.variants.map((v) => v.price)) : p.price;
}
function hasPriceRange(p: ProductCardData) {
  return new Set(p.variants.map((v) => v.price)).size > 1;
}
