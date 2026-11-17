"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWishlist } from "@/components/cart/wishlist-context";
import { wishlistProductsAction } from "@/app/actions/cart";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCardData } from "@/lib/catalog";

export function WishlistView() {
  const wishlist = useWishlist();
  const [products, setProducts] = useState<ProductCardData[] | null>(null);
  const key = wishlist.ids.join(",");

  useEffect(() => {
    if (!wishlist.ready) return;
    let cancelled = false;
    wishlistProductsAction(wishlist.ids).then((p) => !cancelled && setProducts(p));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlist.ready, key]);

  if (!wishlist.ready || products === null) return <div className="min-h-[30vh]" aria-busy="true" />;

  const visible = products.filter((p) => wishlist.ids.includes(p.id));
  if (visible.length === 0) {
    return (
      <div className="py-12">
        <p className="display text-[28px]">Nothing saved yet.</p>
        <p className="mt-3 text-stone">Tap the heart on any piece to keep it here.</p>
        <Link href="/shop" className="btn btn-solid mt-8">
          Shop all jewellery
        </Link>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
      {visible.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
