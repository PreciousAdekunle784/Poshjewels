import Image from "next/image";
import Link from "next/link";
import { and, asc, desc, eq, inArray, like, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import { formatNaira } from "@/lib/format";
import { Empty, PageHeader, StatusPill, td, th } from "@/components/admin/ui";
import { FlagToggle, RemoveSamples, StockInput } from "./product-list-controls";

export const metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; c?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const categories = await db.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder));
  const where: SQL[] = [];
  if (sp.q) where.push(like(schema.products.name, `%${sp.q.trim()}%`));
  if (sp.c) where.push(eq(schema.products.categoryId, Number(sp.c)));
  const products = await db
    .select()
    .from(schema.products)
    .where(where.length ? and(...where) : undefined)
    .orderBy(asc(schema.products.sortOrder), desc(schema.products.createdAt));
  const ids = products.map((p) => p.id);
  const [images, variants] = ids.length
    ? await Promise.all([
        db.select().from(schema.productImages).where(inArray(schema.productImages.productId, ids)).orderBy(asc(schema.productImages.sortOrder)),
        db.select().from(schema.productVariants).where(inArray(schema.productVariants.productId, ids)).orderBy(asc(schema.productVariants.sortOrder)),
      ])
    : [[], []];
  const demoCount = products.filter((p) => p.isDemo).length;

  return (
    <>
      <PageHeader
        title="Products"
        description="Toggle where a piece appears, adjust stock inline, or open a product to edit everything."
        actions={
          <Link href="/admin/products/new" className="btn btn-solid">
            Add product
          </Link>
        }
      />
      {sp.deleted && <p className="mb-4 bg-bone px-4 py-3 text-[14px]">Product deleted.</p>}
      {demoCount > 0 && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-champagne bg-[#f6efe2] px-4 py-3 text-[14px]">
          <p>
            <strong className="font-medium">{demoCount} sample products</strong> are showing in the store so you can preview the design. Edit them into real pieces, or remove them all once your own products are in.
          </p>
          <RemoveSamples count={demoCount} />
        </div>
      )}
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Search products" className="field !min-h-10 w-64 !py-1.5 text-[14px]" />
        <select name="c" defaultValue={sp.c ?? ""} className="field !min-h-10 w-48 !py-1.5 text-[14px]">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="btn btn-outline !min-h-10">Filter</button>
      </form>
      {products.length === 0 ? (
        <Empty href="/admin/products/new" cta="Add your first product">
          No products found.
        </Empty>
      ) : (
        <div className="overflow-x-auto border border-line bg-ivory">
          <table className="w-full min-w-[980px]">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Product</th>
                <th className={th}>Price</th>
                <th className={th}>Stock by option</th>
                <th className={`${th} text-center`}>Live</th>
                <th className={`${th} text-center`}>New in</th>
                <th className={`${th} text-center`}>Favourite</th>
                <th className={`${th} text-center`}>Featured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => {
                const img = images.find((i) => i.productId === p.id);
                const vs = variants.filter((v) => v.productId === p.id);
                const cat = categories.find((c) => c.id === p.categoryId);
                return (
                  <tr key={p.id} className="hover:bg-paper">
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-bone">{img && <Image src={img.url} alt="" fill sizes="44px" className="object-cover" />}</div>
                        <div>
                          <Link href={`/admin/products/${p.id}`} className="font-medium underline-offset-4 hover:underline">
                            {p.name}
                          </Link>
                          <div className="flex flex-wrap gap-1.5 text-[12px] text-stone">
                            {cat?.name ?? "No category"}
                            {p.isDemo && <StatusPill tone="warn">Sample</StatusPill>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`${td} tabular whitespace-nowrap`}>
                      {formatNaira(p.price)}
                      {p.compareAtPrice ? <s className="ml-1.5 text-[12px] text-stone">{formatNaira(p.compareAtPrice)}</s> : null}
                    </td>
                    <td className={td}>
                      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                        {vs.map((v) => (
                          <StockInput key={v.id} variantId={v.id} name={v.name === "Default" ? "" : v.name} stock={v.stock} />
                        ))}
                      </div>
                    </td>
                    <td className={`${td} text-center`}>
                      <FlagToggle id={p.id} flag="isPublished" value={p.isPublished} label={`${p.name} visible in store`} />
                    </td>
                    <td className={`${td} text-center`}>
                      <FlagToggle id={p.id} flag="isNewArrival" value={p.isNewArrival} label={`${p.name} in Just arrived`} />
                    </td>
                    <td className={`${td} text-center`}>
                      <FlagToggle id={p.id} flag="isBestSeller" value={p.isBestSeller} label={`${p.name} in Posh favourites`} />
                    </td>
                    <td className={`${td} text-center`}>
                      <FlagToggle id={p.id} flag="isFeatured" value={p.isFeatured} label={`${p.name} featured`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-[12.5px] text-stone">“New in” feeds the Just arrived section, “Favourite” feeds The Posh favourites, and “Featured” feeds the featured collection when no collection is chosen on the Homepage screen.</p>
    </>
  );
}
