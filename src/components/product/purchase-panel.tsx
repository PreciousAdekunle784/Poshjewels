"use client";

import { useState } from "react";
import type { ProductCardData } from "@/lib/catalog";
import { formatNaira } from "@/lib/format";
import { useCart } from "@/components/cart/cart-context";
import { useWishlist } from "@/components/cart/wishlist-context";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { HeartIcon } from "@/components/icons";

export function PurchasePanel({ product }: { product: ProductCardData }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const showSelector = product.variants.length > 1 || (product.variants[0] && product.variants[0].name !== "Default");
  const firstAvailable = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState<number | undefined>(product.variants.length === 1 ? firstAvailable?.id : undefined);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const variant = product.variants.find((v) => v.id === variantId);
  const price = variant?.price ?? product.price;
  const saved = wishlist.ready && wishlist.has(product.id);

  const inCart = cart.lines.find((l) => l.variantId === variantId)?.quantity ?? 0;
  const available = variant ? Math.max(0, variant.stock - inCart) : 0;

  function addToBag() {
    if (!variant) {
      setError("Choose an option first.");
      return;
    }
    if (available <= 0) {
      setError(inCart > 0 ? "You already have all available stock in your bag." : "This option is sold out.");
      return;
    }
    setError(null);
    cart.add(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        variantName: showSelector ? variant.name : null,
        price: variant.price,
        image: product.images[0]?.url ?? null,
        stock: variant.stock,
      },
      Math.min(qty, available),
    );
    setQty(1);
  }

  let stockText = "";
  if (variant) {
    if (variant.stock <= 0) stockText = "Sold out";
    else if (variant.stock <= 3) stockText = `Only ${variant.stock} left`;
    else stockText = "In stock";
  } else if (!product.inStock) stockText = "Sold out";

  return (
    <div>
      <p className="tabular mt-4 text-[19px] tracking-[0.01em]">
        {product.compareAtPrice && price === product.price ? (
          <>
            <span className="text-oxblood">{formatNaira(price)}</span>
            <s className="ml-3 text-stone">{formatNaira(product.compareAtPrice)}</s>
          </>
        ) : (
          formatNaira(price)
        )}
      </p>

      {showSelector && (
        <fieldset className="mt-8">
          <legend className="mb-3 flex w-full justify-between text-[13.5px]">
            <span>
              <span className="text-stone">Option: </span>
              {variant?.name ?? "Choose one"}
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setVariantId(v.id);
                  setQty(1);
                  setError(null);
                }}
                aria-pressed={v.id === variantId}
                className={`min-h-11 min-w-[3rem] border px-4 text-[14px] transition-colors duration-300 ${
                  v.id === variantId ? "border-espresso bg-espresso text-ivory" : "border-line hover:border-espresso"
                } ${v.stock <= 0 ? "text-stone line-through decoration-1" : ""}`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <p className={`mt-6 flex items-center gap-2 text-[13.5px] ${stockText === "Sold out" ? "text-oxblood" : "text-stone"}`} aria-live="polite">
        {stockText && <span className={`h-1.5 w-1.5 rounded-full ${stockText === "Sold out" ? "bg-oxblood" : stockText === "In stock" ? "bg-moss" : "bg-champagne"}`} aria-hidden />}
        {stockText || "Choose an option to see availability"}
      </p>

      <div className="mt-4 flex gap-3">
        <QuantityStepper value={qty} max={Math.max(1, available)} onChange={setQty} label={product.name} />
        <button type="button" onClick={addToBag} disabled={!product.inStock || (variant && variant.stock <= 0)} className="btn btn-solid btn-buy flex-1">
          {!product.inStock || (variant && variant.stock <= 0) ? (
            <span>Sold out</span>
          ) : (
            <>
              <span>Add to bag</span>
              <span className="btn-buy-price">{formatNaira(price * qty)}</span>
            </>
          )}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-[13.5px] text-oxblood" role="alert">
          {error}
        </p>
      )}

      <button type="button" onClick={() => wishlist.toggle(product.id)} className="mt-4 flex items-center gap-2 text-[14px] underline-offset-4 hover:underline" aria-pressed={saved}>
        <HeartIcon size={17} filled={saved} />
        {saved ? "Saved to wishlist" : "Save to wishlist"}
      </button>
    </div>
  );
}
