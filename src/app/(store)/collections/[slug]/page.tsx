import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection } from "@/lib/catalog";
import { CatalogView, type CatalogSearchParams } from "@/components/catalog/catalog-view";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<CatalogSearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCollection((await params).slug);
  if (!c) return {};
  return { title: c.name, description: c.description ?? undefined, alternates: { canonical: `/collections/${c.slug}` } };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const c = await getCollection((await params).slug);
  if (!c) notFound();
  return (
    <CatalogView
      eyebrow={
        <Link href="/collections" className="hover:underline">
          Collections
        </Link>
      }
      title={c.name}
      intro={c.description}
      query={{ collectionSlug: c.slug }}
      searchParams={await searchParams}
      basePath={`/collections/${c.slug}`}
      showCategoryFilter={false}
      emptyMessage="This collection is being restocked."
    />
  );
}
