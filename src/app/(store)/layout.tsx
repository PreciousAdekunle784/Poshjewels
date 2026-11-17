import { AnnouncementBar } from "@/components/layout/announcement";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/components/cart/cart-context";
import { WishlistProvider } from "@/components/cart/wishlist-context";
import { CartDrawer } from "@/components/cart/cart-drawer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-espresso focus:px-4 focus:py-2 focus:text-ivory">
          Skip to content
        </a>
        <AnnouncementBar />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <CartDrawer />
      </WishlistProvider>
    </CartProvider>
  );
}
