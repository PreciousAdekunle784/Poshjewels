import type { Metadata } from "next";
import { CatalogView, type CatalogSearchParams } from "@/components/catalog/catalog-view";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().slice(0, 80) ?? "";
  return (
    <>
      <form action="/search" role="search" className="wrap pt-10">
        <label htmlFor="q" className="sr-only">
          Search
        </label>
        <div className="flex max-w-xl border-b border-espresso">
          <input id="q" name="q" defaultValue={q} placeholder="Search jewellery" className="h-12 min-w-0 flex-1 bg-transparent text-[17px] outline-none" />
          <button className="cta-link self-center">Search</button>
        </div>
      </form>
      <CatalogView
        title={q ? <>Results for &ldquo;{q}&rdquo;</> : "Search"}
        query={{ q: q || undefined }}
        searchParams={sp}
        basePath="/search"
        emptyMessage={q ? `Nothing matches “${q}”.` : "Search for a piece by name or type."}
      />
    </>
  );
}
