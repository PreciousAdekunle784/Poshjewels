import Image from "next/image";
import Link from "next/link";
import type { ProductCardData } from "@/lib/catalog";
import type { SiteSettings } from "@/lib/settings";
import type { Faq } from "@/db/schema";
import { formatNaira, paragraphs } from "@/lib/format";
import { Emph } from "@/components/emph";
import { ProductCard } from "@/components/product/product-card";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { FaqList } from "@/components/faq-list";

export function SectionHeading({ id, title, copy, href, hrefLabel, aside }: { id: string; title: string; copy?: string; href?: string; hrefLabel?: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 lg:mb-10">
      <div>
        <h2 id={id} className="display text-[32px] lg:text-[42px]">
          {title}
        </h2>
        {copy && <p className="mt-2 text-stone">{copy}</p>}
      </div>
      {href && (
        <Link href={href} className="label link mb-2 shrink-0">
          {hrefLabel ?? "View all"}
        </Link>
      )}
      {aside}
    </div>
  );
}

export function NewArrivals({ products, heading, copy }: { products: ProductCardData[]; heading: string; copy: string }) {
  if (products.length === 0) return null;
  return (
    <section className="wrap pb-16 lg:pb-24" aria-labelledby="new-arrivals">
      <SectionHeading id="new-arrivals" title={heading} copy={copy} href="/collections/new-arrivals" hrefLabel="View all new in" />
      <ul className="grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-12">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FeaturedCollection({ featured, products }: { featured: SiteSettings["featured"]; products: ProductCardData[] }) {
  if (!featured.enabled) return null;
  const href = featured.collectionSlug ? `/collections/${featured.collectionSlug}` : "/shop";
  return (
    <section className="bg-bone" aria-labelledby="featured-collection">
      <div className="lg:grid lg:grid-cols-2">
        <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[760px]">
          <Image src={featured.image} alt={featured.imageAlt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center px-4 py-14 sm:px-8 lg:px-14 xl:px-20">
          {featured.eyebrow && <p className="label text-stone">{featured.eyebrow}</p>}
          <h2 id="featured-collection" className="display mt-3 text-[36px] lg:text-[50px]">
            <Emph text={featured.headline} />
          </h2>
          <p className="mt-4 max-w-[44ch] leading-relaxed text-stone">{featured.copy}</p>
          <Link href={href} className="btn btn-solid mt-8 self-start">
            {featured.ctaLabel}
          </Link>
          {products.length > 0 && (
            <ul className="mt-12 grid grid-cols-3 gap-3 border-t border-espresso/15 pt-8">
              {products.slice(0, 3).map((p) => (
                <li key={p.id}>
                  <Link href={`/product/${p.slug}`} className="group block">
                    <div className="relative aspect-square overflow-hidden bg-ivory">
                      {p.images[0] && <Image src={p.images[0].url} alt={p.images[0].alt} fill sizes="(min-width:1024px) 12vw, 30vw" className="object-cover" />}
                    </div>
                    <p className="mt-2 text-[13px] leading-snug group-hover:underline">{p.name}</p>
                    <p className="tabular text-[12.5px] text-stone">{formatNaira(p.price)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export function BrandEditorial({ editorial }: { editorial: SiteSettings["editorial"] }) {
  if (!editorial.enabled) return null;
  return (
    <section className="bg-cocoa text-ivory" aria-labelledby="brand-editorial">
      <div className="wrap grid items-center gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-28">
        <div className="relative aspect-[4/5] overflow-hidden lg:col-span-5">
          <Image src={editorial.imageA} alt={editorial.imageAAlt} fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover object-[62%_50%]" />
        </div>
        <div className="lg:col-span-4 lg:col-start-7">
          <h2 id="brand-editorial" className="display text-[38px] lg:text-[54px]">
            <Emph text={editorial.headline} />
          </h2>
          <div className="prose-posh mt-6 max-w-[42ch] leading-relaxed text-ivory/80">
            {paragraphs(editorial.body).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {editorial.ctaLabel && (
            <Link href={editorial.ctaHref} className="btn btn-light mt-9">
              {editorial.ctaLabel}
            </Link>
          )}
        </div>
        {editorial.imageB && (
          <div className="relative hidden aspect-[3/4] self-end overflow-hidden lg:col-span-2 lg:col-start-11 lg:block">
            <Image src={editorial.imageB} alt={editorial.imageBAlt} fill sizes="16vw" className="object-cover" />
          </div>
        )}
      </div>
    </section>
  );
}

type ReviewRow = { r: { id: number; name: string; body: string; verifiedBuyer: boolean }; productName: string | null; productSlug: string | null };

export function Reviews({ reviews, heading }: { reviews: ReviewRow[]; heading: string }) {
  if (reviews.length === 0) return null;
  return (
    <section className="wrap py-16 lg:py-24" aria-labelledby="reviews">
      <h2 id="reviews" className="display text-[32px] lg:text-[42px]">
        {heading}
      </h2>
      <ul className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
        {reviews.slice(0, 3).map(({ r, productName, productSlug }) => (
          <li key={r.id} className="border-t border-espresso/20 pt-6">
            <blockquote className="display text-[21px] leading-snug">&ldquo;{r.body}&rdquo;</blockquote>
            <p className="mt-5 text-[13.5px]">
              {r.name}
              {r.verifiedBuyer && <span className="text-stone"> · Verified buyer</span>}
            </p>
            {productName && productSlug && (
              <Link href={`/product/${productSlug}`} className="mt-1 inline-block text-[13px] text-stone underline-offset-4 hover:underline">
                {productName}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FaqSection({ faqs, heading }: { faqs: Faq[]; heading: string }) {
  if (faqs.length === 0) return null;
  return (
    <section className="wrap grid gap-10 border-t border-line py-16 lg:grid-cols-12 lg:py-24" aria-labelledby="faq">
      <div className="lg:col-span-4">
        <h2 id="faq" className="display text-[32px] lg:text-[42px]">
          {heading}
        </h2>
        <p className="mt-4 max-w-[34ch] text-stone">
          Can&rsquo;t find what you need?{" "}
          <Link href="/contact" className="link text-espresso">
            Send us a message
          </Link>{" "}
          and we&rsquo;ll get back to you.
        </p>
      </div>
      <div className="lg:col-span-7 lg:col-start-6">
        <FaqList faqs={faqs.slice(0, 6)} />
        {faqs.length > 6 && (
          <Link href="/faq" className="label link mt-6 inline-block">
            All questions
          </Link>
        )}
      </div>
    </section>
  );
}

export function NewsletterBand({ newsletter }: { newsletter: SiteSettings["newsletter"] }) {
  return (
    <section className="bg-bone" aria-labelledby="newsletter">
      <div className="wrap grid items-end gap-8 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div>
          <h2 id="newsletter" className="display text-[32px] lg:text-[42px]">
            <Emph text={newsletter.headline} />
          </h2>
          <p className="mt-3 text-stone">{newsletter.copy}</p>
        </div>
        <div className="lg:pb-1">
          <NewsletterForm source="homepage" />
        </div>
      </div>
    </section>
  );
}
