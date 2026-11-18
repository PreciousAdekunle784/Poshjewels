import { asc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { listProducts } from "@/lib/catalog";
import { AnnouncementBar } from "@/components/layout/announcement";
import { Header, type MenuData } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/components/cart/cart-context";
import { WishlistProvider } from "@/components/cart/wishlist-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { PageTransition } from "@/components/motion/page-transition";

async function getMenu(): Promise<MenuData> {
  const [categories, counts, collections] = await Promise.all([
    db.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name)),
    db
      .select({ categoryId: schema.products.categoryId, count: sql<number>`count(*)` })
      .from(schema.products)
      .where(eq(schema.products.isPublished, true))
      .groupBy(schema.products.categoryId),
    db.select({ slug: schema.collections.slug, name: schema.collections.name }).from(schema.collections).where(eq(schema.collections.isPublished, true)).orderBy(asc(schema.collections.sortOrder)),
  ]);
  // Three pieces per category for the Shop menu's "way in" row.
  const pieces = await Promise.all(categories.map((c) => listProducts({ categorySlug: c.slug, perPage: 3 })));
  return {
    categories: categories.map((c, n) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl,
      count: Number(counts.find((x) => x.categoryId === c.id)?.count ?? 0),
      pieces: pieces[n].items.map((p) => ({ slug: p.slug, name: p.name, price: p.price, image: p.images[0]?.url ?? null })),
    })),
    collections,
  };
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const menu = await getMenu();
  return (
    <CartProvider>
      <WishlistProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-espresso focus:px-4 focus:py-2 focus:text-ivory">
          Skip to content
        </a>
        <AnnouncementBar />
        <Header menu={menu} />
        <main id="main">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <CartDrawer />
      </WishlistProvider>
    </CartProvider>
  );
}
