import type { Metadata } from "next";
import { CatalogView, type CatalogSearchParams } from "@/components/catalog/catalog-view";

export const metadata: Metadata = {
  title: "Shop all jewellery",
  description: "Necklaces, earrings, bracelets, rings and jewellery sets from Posh Jewel.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  return <CatalogView title="Shop all" intro="Every piece in the collection, from fine everyday chains to statement sparkle." query={{}} searchParams={await searchParams} basePath="/shop" />;
}
