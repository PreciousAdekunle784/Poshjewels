"use client";

import Image from "next/image";
import Link, { useLinkStatus } from "next/link";
import { useEffect, useRef, useState, ViewTransition } from "react";
import type { ProductCardData } from "@/lib/catalog";
import { formatNaira } from "@/lib/format";
import { useCart } from "@/components/cart/cart-context";
import { useWishlist } from "@/components/cart/wishlist-context";
import { CloseIcon, HeartIcon } from "@/components/icons";

/** A hairline that draws along the base of the photo while the product page is loading. */
function PendingLine() {
  const { pending } = useLinkStatus();
  return <span className="card-pending absolute inset-x-0 bottom-0 z-10 h-[2px] bg-espresso" data-on={pending} aria-hidden />;
}

export function ProductCard({ product, sizes, priority }: { product: ProductCardData; sizes?: string; priority?: boolean }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const [choosing, setChoosing] = useState(false);
  // Only the card that was clicked carries the shared name, so duplicates on a page never collide.
  const [morph, setMorph] = useState(false);
  const chooserRef = useRef<HTMLDivElement>(null);
  const href = `/product/${product.slug}`;
  const [first, second] = product.images;
  const hasChoice = product.variants.length > 1;
  const saved = wishlist.ready && wishlist.has(product.id);
  const imgSizes = sizes ?? "(min-width:1024px) 23vw, (min-width:640px) 31vw, 46vw";

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
    <article className="card group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-bone">
        <Link href={href} aria-label={product.name} className="absolute inset-0" onClick={() => setMorph(true)}>
          {first && (
            <ViewTransition name={morph ? `product-${product.id}` : undefined} share="morph" default="none">
              <Image src={first.url} alt={first.alt} fill sizes={imgSizes} className="object-cover" priority={priority} />
            </ViewTransition>
          )}
          {second && (
            <span className="card-alt absolute inset-0">
              <Image src={second.url} alt="" fill sizes={imgSizes} className="object-cover" />
            </span>
          )}
          <PendingLine />
        </Link>

        {status && <span className="pointer-events-none absolute left-0 top-3 bg-ivory px-2.5 py-1 text-[12px] font-medium">{status}</span>}

        <button
          type="button"
          onClick={() => wishlist.toggle(product.id)}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center bg-ivory/85 text-espresso transition-colors hover:bg-ivory"
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={saved}
        >
          <HeartIcon size={17} filled={saved} />
        </button>

        {/* Pointer devices: an add strip unveils from the base on hover. Touch: a small, always-visible plus. */}
        {product.inStock && !choosing && (
          <>
            <button
              type="button"
              onClick={quickAdd}
              className="card-add absolute inset-x-0 bottom-0 hidden h-12 [@media(hover:hover)]:block"
            >
              <span className="card-add-face flex h-full items-center justify-between bg-ivory px-4 text-[14px] font-medium">
                <span>{hasChoice ? "Choose an option" : "Add to bag"}</span>
                <span className="plus relative h-3 w-3" aria-hidden>
                  <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
                  <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current" />
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={quickAdd}
              className="absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center bg-ivory [@media(hover:hover)]:hidden"
              aria-label={`Add ${product.name} to bag`}
            >
              <span className="relative h-3 w-3" aria-hidden>
                <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
                <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current" />
              </span>
            </button>
          </>
        )}

        {choosing && (
          <div ref={chooserRef} className="absolute inset-x-0 bottom-0 bg-ivory p-3" role="group" aria-label={`Choose an option for ${product.name}`}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] text-stone">Choose an option</span>
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
                  className="min-h-9 border border-line px-3 text-[13.5px] transition-colors hover:border-espresso hover:bg-espresso hover:text-ivory disabled:text-stone/60 disabled:line-through"
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <h3 className="t-product">
          <Link href={href} className="hover:underline hover:underline-offset-4" onClick={() => setMorph(true)}>
            {product.name}
          </Link>
        </h3>
        <p className="t-price shrink-0 sm:text-right">
          {product.compareAtPrice ? (
            <>
              <span className="text-oxblood">{formatNaira(product.price)}</span>
              <s className="ml-2 hidden sm:inline">{formatNaira(product.compareAtPrice)}</s>
            </>
          ) : hasPriceRange(product) ? (
            `From ${formatNaira(minPrice(product))}`
          ) : (
            formatNaira(product.price)
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
