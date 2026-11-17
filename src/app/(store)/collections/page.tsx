import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { asc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { getCollections } from "@/lib/catalog";

export const metadata: Metadata = { title: "Collections", description: "Curated edits from Posh Jewel.", alternates: { canonical: "/collections" } };

export default async function CollectionsPage() {
  const collections = await getCollections();
  // Use the collection's own image, or fall back to the first product image in it.
  const ids = collections.map((c) => c.id);
  const firstImages = ids.length
    ? await db
        .select({ collectionId: schema.productCollections.collectionId, url: schema.productImages.url, sort: schema.products.sortOrder })
        .from(schema.productCollections)
        .innerJoin(schema.products, eq(schema.products.id, schema.productCollections.productId))
        .innerJoin(schema.productImages, eq(schema.productImages.productId, schema.products.id))
        .where(inArray(schema.productCollections.collectionId, ids))
        .orderBy(asc(schema.products.sortOrder), asc(schema.productImages.sortOrder))
    : [];
  // Fallback cover: the first product image in the collection not already used by another collection.
  const used = new Set(collections.map((c) => c.imageUrl).filter(Boolean));
  const pickFallback = (id: number) => {
    const url = firstImages.find((f) => f.collectionId === id && !used.has(f.url))?.url;
    if (url) used.add(url);
    return url;
  };
  return (
    <div className="wrap pb-24">
      <header className="pb-10 pt-10 lg:pt-14">
        <h1 className="display t-title">Collections</h1>
        <p className="mt-3 max-w-[46ch] text-stone">Edits put together around a mood, a moment or a way of wearing.</p>
      </header>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-4 lg:gap-x-5">
        {collections.map((c) => {
          const img = c.imageUrl ?? pickFallback(c.id);
          return (
            <li key={c.id}>
              <Link href={`/collections/${c.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-bone">
                  {img && <Image src={img} alt="" fill sizes="(min-width:1024px) 23vw, 50vw" className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.03]" />}
                </div>
                <h2 className="display mt-4 text-[22px] lg:text-[26px]">{c.name}</h2>
                {c.description && <p className="mt-1 max-w-[40ch] text-[14px] text-stone">{c.description}</p>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
