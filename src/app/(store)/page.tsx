import { sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { getApprovedReviews, getCategories, getFaqs, listProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { Hero } from "@/components/home/hero";
import { CategoryMosaic } from "@/components/home/category-mosaic";
import { ProductRail } from "@/components/home/product-rail";
import { BrandEditorial, FaqSection, FeaturedCollection, NewArrivals, NewsletterBand, Reviews } from "@/components/home/sections";

export default async function HomePage() {
  const settings = await getSettings(["hero", "featured", "editorial", "sections", "newsletter"]);
  const [categories, counts, newArrivals, bestSellers, featuredProducts, reviews, faqs] = await Promise.all([
    getCategories(),
    db
      .select({ categoryId: schema.products.categoryId, count: sql<number>`count(*)` })
      .from(schema.products)
      .where(sql`${schema.products.isPublished} = 1`)
      .groupBy(schema.products.categoryId),
    listProducts({ newArrival: true, sort: "newest", perPage: 8 }),
    listProducts({ bestSeller: true, perPage: 12 }),
    settings.featured.collectionSlug
      ? listProducts({ collectionSlug: settings.featured.collectionSlug, perPage: 3 })
      : listProducts({ featured: true, perPage: 3 }),
    getApprovedReviews({ homepage: true, limit: 3 }),
    getFaqs(),
  ]);

  const tiles = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    imageUrl: c.imageUrl,
    count: Number(counts.find((x) => x.categoryId === c.id)?.count ?? 0),
  }));

  return (
    <>
      <Hero hero={settings.hero} />
      <CategoryMosaic categories={tiles} />
      <NewArrivals products={newArrivals.items} heading={settings.sections.newArrivalsHeading} copy={settings.sections.newArrivalsCopy} />
      <FeaturedCollection featured={settings.featured} products={featuredProducts.items} />
      {bestSellers.items.length > 0 && (
        <section className="wrap py-16 lg:py-24" aria-labelledby="best-sellers">
          <ProductRail id="best-sellers" products={bestSellers.items} title={settings.sections.bestSellersHeading} copy={settings.sections.bestSellersCopy} />
        </section>
      )}
      <BrandEditorial editorial={settings.editorial} />
      <Reviews reviews={reviews} heading={settings.sections.reviewsHeading} />
      <FaqSection faqs={faqs} heading={settings.sections.faqHeading} />
      <NewsletterBand newsletter={settings.newsletter} />
    </>
  );
}
