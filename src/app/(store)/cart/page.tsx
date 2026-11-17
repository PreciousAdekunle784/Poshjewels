import type { Metadata } from "next";
import { CartView } from "./cart-view";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="wrap pb-24">
      <h1 className="display pb-8 pt-10 text-[40px] lg:pt-14 lg:text-[52px]">Your bag</h1>
      <CartView />
    </div>
  );
}
