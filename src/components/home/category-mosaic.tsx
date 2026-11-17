import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Arrow, CtaLink } from "@/components/ui/cta";
import { RevealTitle } from "./sections";

export type CategoryTile = { slug: string; name: string; imageUrl: string | null; count: number };

/**
 * Asymmetric mosaic: the first category is the tall anchor, the rest sit in a 2×2 grid beside it.
 * Tiles unveil in reading order; each carries an ivory swing tag with the name and number of pieces.
 */
export function CategoryMosaic({ categories }: { categories: CategoryTile[] }) {
  if (categories.length === 0) return null;
  const [anchor, ...rest] = categories;
  return (
    <section className="wrap py-20 lg:py-28" aria-labelledby="shop-by-category">
      <div className="mb-9 flex items-end justify-between gap-6 lg:mb-12">
        <RevealTitle id="shop-by-category" text="Shop by category" />
        <CtaLink href="/shop" className="mb-1 shrink-0">
          View every piece
        </CtaLink>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:h-[min(78vw,780px)] lg:grid-cols-[1.25fr_1fr_1fr] lg:grid-rows-2">
        <Tile tile={anchor} delay={0} className="col-span-2 aspect-[4/5] sm:aspect-[16/11] lg:col-span-1 lg:row-span-2 lg:aspect-auto" sizes="(min-width:1024px) 38vw, 100vw" />
        {rest.slice(0, 4).map((c, i) => (
          <Tile key={c.slug} tile={c} delay={120 + i * 110} className="aspect-[4/5] lg:aspect-auto" sizes="(min-width:1024px) 30vw, 50vw" />
        ))}
      </div>
    </section>
  );
}

function Tile({ tile, className, sizes, delay }: { tile: CategoryTile; className: string; sizes: string; delay: number }) {
  return (
    <Reveal kind="unveil" delay={delay} className={`relative overflow-hidden bg-bone ${className}`}>
      <Link href={`/shop/${tile.slug}`} className="group absolute inset-0 block">
        {tile.imageUrl && (
          <span className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-silk)] group-hover:scale-[1.035]">
            <Image src={tile.imageUrl} alt="" fill sizes={sizes} className="object-cover" />
          </span>
        )}
        <span className="tag absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
          <span className="display text-[21px] sm:text-[25px]">{tile.name}</span>
          <span className="hidden text-[12.5px] text-stone sm:inline">{tile.count}</span>
          <span className="hidden -translate-x-1.5 opacity-0 transition duration-500 ease-[var(--ease-silk)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:inline-flex">
            <Arrow />
          </span>
        </span>
      </Link>
    </Reveal>
  );
}
