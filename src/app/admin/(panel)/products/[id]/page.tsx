import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { PageHeader } from "@/components/admin/ui";
import { editorOptions } from "@/lib/admin-data";
import { ProductEditor } from "../product-editor";

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; saved?: string }> }) {
  const id = Number((await params).id);
  const { created, saved } = await searchParams;
  const product = Number.isInteger(id) ? await db.query.products.findFirst({ where: eq(schema.products.id, id) }) : undefined;
  if (!product) notFound();
  const [images, variants, cols, options] = await Promise.all([
    db.select().from(schema.productImages).where(eq(schema.productImages.productId, id)).orderBy(asc(schema.productImages.sortOrder)),
    db.select().from(schema.productVariants).where(eq(schema.productVariants.productId, id)).orderBy(asc(schema.productVariants.sortOrder)),
    db.select().from(schema.productCollections).where(eq(schema.productCollections.productId, id)),
    editorOptions(),
  ]);
  return (
    <>
      <PageHeader
        title={product.name}
        actions={
          <Link href="/admin/products" className="btn btn-outline">
            Back to products
          </Link>
        }
      />
      {(created || saved) && (
        <p className="mb-5 bg-[#e3eadf] px-4 py-3 text-[14px] text-moss" role="status">
          {created ? "Product created." : "Changes saved."}{" "}
          <a href={`/product/${product.slug}`} target="_blank" className="underline underline-offset-4">
            View in store
          </a>
        </p>
      )}
      <ProductEditor
        key={product.updatedAt.getTime()}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          details: product.details,
          categoryId: product.categoryId,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          label: product.label,
          isPublished: product.isPublished,
          isNewArrival: product.isNewArrival,
          isBestSeller: product.isBestSeller,
          isFeatured: product.isFeatured,
          isDemo: product.isDemo,
          collectionIds: cols.map((c) => c.collectionId),
          images: images.map((i) => ({ url: i.url, alt: i.alt })),
          variants: variants.map((v) => ({ id: v.id, name: v.name, sku: v.sku, priceOverride: v.priceOverride, stock: v.stock })),
        }}
        categories={options.categories}
        collections={options.collections}
      />
    </>
  );
}
