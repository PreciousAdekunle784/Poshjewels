import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { SITE_URL } from "@/lib/site";

// Built on request so newly added products appear without a rebuild.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, collections] = await Promise.all([
    db.select({ slug: schema.products.slug, updatedAt: schema.products.updatedAt }).from(schema.products).where(eq(schema.products.isPublished, true)),
    db.select({ slug: schema.categories.slug }).from(schema.categories),
    db.select({ slug: schema.collections.slug }).from(schema.collections).where(eq(schema.collections.isPublished, true)),
  ]);
  const staticPaths = ["", "/shop", "/collections", "/about", "/contact", "/faq", "/pages/shipping", "/pages/returns", "/pages/privacy", "/pages/terms"];
  return [
    ...staticPaths.map((p) => ({ url: `${SITE_URL}${p}` })),
    ...categories.map((c) => ({ url: `${SITE_URL}/shop/${c.slug}` })),
    ...collections.map((c) => ({ url: `${SITE_URL}/collections/${c.slug}` })),
    ...products.map((p) => ({ url: `${SITE_URL}/product/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
