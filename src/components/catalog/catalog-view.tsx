import Link from "next/link";
import { Suspense } from "react";
import { getCategories, listProducts, SORTS, type ProductQuery, type SortKey } from "@/lib/catalog";
import { ProductCard } from "@/components/product/product-card";
import { CatalogToolbar } from "./catalog-toolbar";

export type CatalogSearchParams = { [k: string]: string | string[] | undefined };

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export function parseCatalogParams(sp: CatalogSearchParams) {
  const sortRaw = one(sp.sort);
  const sort: SortKey = sortRaw && sortRaw in SORTS ? (sortRaw as SortKey) : "featured";
  const num = (v: string | undefined) => (v && /^\d+$/.test(v) ? Number(v) : undefined);
  return {
    sort,
    minPrice: num(one(sp.min)),
    maxPrice: num(one(sp.max)),
    inStockOnly: one(sp.stock) === "1",
    page: num(one(sp.page)) ?? 1,
  };
}

export async function CatalogView({
  title,
  intro,
  eyebrow,
  query,
  searchParams,
  basePath,
  activeCategory,
  showCategoryFilter = true,
  emptyMessage = "No pieces match these filters yet.",
}: {
  title: React.ReactNode;
  intro?: string | null;
  eyebrow?: React.ReactNode;
  query: ProductQuery;
  searchParams: CatalogSearchParams;
  basePath: string;
  activeCategory?: string;
  showCategoryFilter?: boolean;
  emptyMessage?: string;
}) {
  const params = parseCatalogParams(searchParams);
  const [result, categories] = await Promise.all([listProducts({ ...query, ...params, perPage: 16 }), getCategories()]);

  const preserved = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    const val = one(v);
    if (val && k !== "page") preserved.set(k, val);
  }
  const pageHref = (n: number) => {
    const sp = new URLSearchParams(preserved);
    if (n > 1) sp.set("page", String(n));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const keep = (() => {
    const sp = new URLSearchParams(preserved);
    sp.delete("q");
    const qs = sp.toString();
    return qs ? `?${qs}` : "";
  })();

  const categoryLinks = [
    { href: `/shop${keep}`, label: "All jewellery", active: !activeCategory },
    ...categories.map((c) => ({ href: `/shop/${c.slug}${keep}`, label: c.name, active: activeCategory === c.slug })),
  ];

  return (
    <div className="wrap pb-20">
      <header className="grid gap-4 pb-8 pt-10 lg:grid-cols-12 lg:items-end lg:pb-10 lg:pt-14">
        <div className="lg:col-span-7">
          {eyebrow && <div className="label mb-3 text-stone">{eyebrow}</div>}
          <h1 className="display text-[40px] lg:text-[56px]">{title}</h1>
        </div>
        {intro && <p className="max-w-[46ch] leading-relaxed text-stone lg:col-span-4 lg:col-start-9">{intro}</p>}
      </header>

      <Suspense fallback={<div className="h-14 border-y border-line" />}>
        <CatalogToolbar total={result.total} categoryLinks={categoryLinks} showCategory={showCategoryFilter} />
      </Suspense>

      {result.items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="display text-[28px]">{emptyMessage}</p>
          <p className="mt-3 text-stone">Try removing a filter, or browse everything.</p>
          <Link href="/shop" className="btn btn-outline mt-8">
            Shop all jewellery
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 lg:mt-10 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-14">
          {result.items.map((p, i) => (
            <li key={p.id}>
              <ProductCard product={p} priority={i < 4} />
            </li>
          ))}
        </ul>
      )}

      {result.pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-16 flex items-center justify-center gap-1">
          {result.page > 1 && (
            <Link href={pageHref(result.page - 1)} className="label px-3 py-2 hover:underline">
              Previous
            </Link>
          )}
          {Array.from({ length: result.pageCount }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={pageHref(n)}
              aria-current={n === result.page ? "page" : undefined}
              className={`tabular flex h-10 w-10 items-center justify-center text-[14px] ${n === result.page ? "border border-espresso" : "hover:underline"}`}
            >
              {n}
            </Link>
          ))}
          {result.page < result.pageCount && (
            <Link href={pageHref(result.page + 1)} className="label px-3 py-2 hover:underline">
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
