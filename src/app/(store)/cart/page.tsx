import type { Metadata } from "next";
import { CartView } from "./cart-view";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="wrap pb-24">
      <h1 className="display t-title pb-8 pt-10 lg:pt-14">Your bag</h1>
      <CartView />
    </div>
  );
}
