import type { Metadata } from "next";
import { WishlistView } from "./wishlist-view";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default function WishlistPage() {
  return (
    <div className="wrap pb-24">
      <h1 className="display t-title pb-2 pt-10 lg:pt-14">Wishlist</h1>
      <p className="mb-10 text-stone">Saved on this device. Add pieces to your bag when you&rsquo;re ready.</p>
      <WishlistView />
    </div>
  );
}
