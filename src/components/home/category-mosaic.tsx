import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";

export type CategoryTile = { slug: string; name: string; imageUrl: string | null; count: number };

/**
 * Asymmetric mosaic: the first category is the tall anchor, the rest sit in a 2×2 grid beside it.
 * Each tile carries an ivory swing tag with the category name and number of pieces.
 */
export function CategoryMosaic({ categories }: { categories: CategoryTile[] }) {
  if (categories.length === 0) return null;
  const [anchor, ...rest] = categories;
  return (
    <section className="wrap py-16 lg:py-24" aria-labelledby="shop-by-category">
      <div className="mb-8 flex items-end justify-between gap-6 lg:mb-10">
        <h2 id="shop-by-category" className="display text-[32px] lg:text-[42px]">
          Shop by category
        </h2>
        <Link href="/shop" className="label link mb-2 shrink-0">
          Shop all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:h-[min(78vw,760px)] lg:grid-cols-[1.25fr_1fr_1fr] lg:grid-rows-2">
        <Tile tile={anchor} className="col-span-2 aspect-[4/5] sm:aspect-[16/11] lg:col-span-1 lg:row-span-2 lg:aspect-auto" sizes="(min-width:1024px) 38vw, 100vw" />
        {rest.slice(0, 4).map((c) => (
          <Tile key={c.slug} tile={c} className="aspect-[4/5] lg:aspect-auto" sizes="(min-width:1024px) 30vw, 50vw" />
        ))}
      </div>
    </section>
  );
}

function Tile({ tile, className, sizes }: { tile: CategoryTile; className: string; sizes: string }) {
  return (
    <Link href={`/shop/${tile.slug}`} className={`group relative block overflow-hidden bg-bone ${className}`}>
      {tile.imageUrl && (
        <Image src={tile.imageUrl} alt="" fill sizes={sizes} className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]" />
      )}
      <span className="tag absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
        <span className="display text-[17px] sm:text-[19px]">{tile.name}</span>
        <span className="hidden text-[12px] text-stone sm:inline">{tile.count} {tile.count === 1 ? "piece" : "pieces"}</span>
        <ArrowIcon size={15} className="-ml-1 hidden transition-transform group-hover:translate-x-0.5 sm:block" />
      </span>
    </Link>
  );
}
