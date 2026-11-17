import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory } from "@/lib/catalog";
import { CatalogView, type CatalogSearchParams } from "@/components/catalog/catalog-view";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<CatalogSearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory((await params).category);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `Shop ${category.name.toLowerCase()} from Posh Jewel.`,
    alternates: { canonical: `/shop/${category.slug}` },
    openGraph: category.imageUrl ? { images: [category.imageUrl] } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await getCategory((await params).category);
  if (!category) notFound();
  return (
    <CatalogView
      eyebrow={
        <Link href="/shop" className="hover:underline">
          Shop all
        </Link>
      }
      title={category.name}
      intro={category.description}
      query={{ categorySlug: category.slug }}
      searchParams={await searchParams}
      basePath={`/shop/${category.slug}`}
      activeCategory={category.slug}
      emptyMessage={`No ${category.name.toLowerCase()} match these filters yet.`}
    />
  );
}
