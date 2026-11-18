import Image from "next/image";
import Link from "next/link";
import type { ProductCardData } from "@/lib/catalog";
import type { SiteSettings } from "@/lib/settings";
import type { Faq } from "@/db/schema";
import { formatNaira, paragraphs } from "@/lib/format";
import { ProductCard } from "@/components/product/product-card";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { FaqList } from "@/components/faq-list";
import { Reveal } from "@/components/motion/reveal";
import { Words, plain } from "@/components/motion/words";
import { CtaLink, FrameCta } from "@/components/ui/cta";

/** Section title that rises word by word through a mask as it scrolls into view. */
export function RevealTitle({ id, text, className = "" }: { id?: string; text: string; className?: string }) {
  return (
    <Reveal as="h2" kind="words" id={id} className={`display t-section ${className}`} aria-label={plain(text)}>
      <Words text={text} />
    </Reveal>
  );
}

export function SectionHeading({ id, title, copy, href, hrefLabel, aside }: { id: string; title: string; copy?: string; href?: string; hrefLabel?: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-9 flex items-end justify-between gap-6 lg:mb-12">
      <div>
        <RevealTitle id={id} text={title} />
        {copy && (
          <Reveal as="p" kind="rise" delay={200} className="mt-3 text-stone">
            {copy}
          </Reveal>
        )}
      </div>
      {href && (
        <CtaLink href={href} className="mb-1 hidden shrink-0 sm:inline-flex">
          {hrefLabel ?? "View all"}
        </CtaLink>
      )}
      {aside}
    </div>
  );
}

export function NewArrivals({ products, heading, copy }: { products: ProductCardData[]; heading: string; copy: string }) {
  if (products.length === 0) return null;
  return (
    <section className="wrap pb-20 lg:pb-28" aria-labelledby="new-arrivals">
      <SectionHeading id="new-arrivals" title={heading} copy={copy} href="/collections/new-arrivals" hrefLabel="See all new arrivals" />
      <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-14">
        {products.map((p, i) => (
          <Reveal as="li" key={p.id} kind="rise" delay={(i % 4) * 80}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </ul>
      <CtaLink href="/collections/new-arrivals" className="mt-10 sm:hidden">
        See all new arrivals
      </CtaLink>
    </section>
  );
}

export function FeaturedCollection({ featured, products }: { featured: SiteSettings["featured"]; products: ProductCardData[] }) {
  if (!featured.enabled) return null;
  const href = featured.collectionSlug ? `/collections/${featured.collectionSlug}` : "/shop";
  return (
    <section className="bg-bone" aria-labelledby="featured-collection">
      <div className="lg:grid lg:grid-cols-2">
        <Reveal kind="unveil" className="relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:min-h-[780px]">
          <Image src={featured.image} alt={featured.imageAlt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        </Reveal>
        <div className="flex flex-col justify-center px-4 py-14 sm:px-8 lg:px-14 xl:px-20">
          {featured.eyebrow && <p className="label text-stone">{featured.eyebrow}</p>}
          <RevealTitle id="featured-collection" text={featured.headline} className="mt-4" />
          <Reveal as="p" kind="rise" delay={180} className="mt-5 max-w-[44ch] leading-relaxed text-stone">
            {featured.copy}
          </Reveal>
          <Reveal kind="rise" delay={280} className="mt-9">
            <FrameCta href={href}>{featured.ctaLabel}</FrameCta>
          </Reveal>
          {products.length > 0 && (
            <ul className="mt-14 grid grid-cols-3 gap-3 border-t border-espresso/15 pt-8">
              {products.slice(0, 3).map((p, i) => (
                <Reveal as="li" key={p.id} kind="rise" delay={i * 90}>
                  <Link href={`/product/${p.slug}`} className="group block">
                    <div className="relative aspect-square overflow-hidden bg-ivory">
                      {p.images[0] && <Image src={p.images[0].url} alt={p.images[0].alt} fill sizes="(min-width:1024px) 12vw, 30vw" className="object-cover transition-transform duration-[900ms] ease-[var(--ease-silk)] group-hover:scale-[1.04]" />}
                    </div>
                    <p className="t-product mt-2 text-[13.5px] group-hover:underline group-hover:underline-offset-4">{p.name}</p>
                    <p className="t-price text-[13px]">{formatNaira(p.price)}</p>
                  </Link>
                </Reveal>
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
      <div className="wrap grid items-center gap-10 py-20 lg:grid-cols-12 lg:gap-8 lg:py-32">
        <Reveal kind="unveil" className="relative aspect-[4/5] overflow-hidden lg:col-span-5">
          <Image src={editorial.imageA} alt={editorial.imageAAlt} fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover object-[62%_50%]" />
        </Reveal>
        <div className="lg:col-span-4 lg:col-start-7">
          <RevealTitle id="brand-editorial" text={editorial.headline} />
          <Reveal kind="rise" delay={200} className="prose-posh mt-7 max-w-[42ch] leading-relaxed text-ivory/80">
            {paragraphs(editorial.body).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>
          {editorial.ctaLabel && (
            <Reveal kind="rise" delay={320} className="mt-10">
              <FrameCta href={editorial.ctaHref} light>
                {editorial.ctaLabel}
              </FrameCta>
            </Reveal>
          )}
        </div>
        {editorial.imageB && (
          <Reveal kind="unveil" delay={350} className="relative hidden aspect-[3/4] self-end overflow-hidden lg:col-span-2 lg:col-start-11 lg:block">
            <Image src={editorial.imageB} alt={editorial.imageBAlt} fill sizes="16vw" className="object-cover" />
          </Reveal>
        )}
      </div>
    </section>
  );
}

type ReviewRow = { r: { id: number; name: string; body: string; verifiedBuyer: boolean }; productName: string | null; productSlug: string | null };

export function Reviews({ reviews, heading }: { reviews: ReviewRow[]; heading: string }) {
  if (reviews.length === 0) return null;
  return (
    <section className="wrap py-20 lg:py-28" aria-labelledby="reviews">
      <RevealTitle id="reviews" text={heading} />
      <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
        {reviews.slice(0, 3).map(({ r, productName, productSlug }, i) => (
          <Reveal as="li" key={r.id} kind="rise" delay={i * 100} className="border-t border-espresso/20 pt-6">
            <blockquote className="display text-[26px] leading-[1.08]">&ldquo;{r.body}&rdquo;</blockquote>
            <p className="mt-5 text-[14px]">
              {r.name}
              {r.verifiedBuyer && <span className="text-stone"> · Verified buyer</span>}
            </p>
            {productName && productSlug && (
              <Link href={`/product/${productSlug}`} className="mt-1 inline-block text-[13.5px] text-stone underline-offset-4 hover:underline">
                {productName}
              </Link>
            )}
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

export function FaqSection({ faqs, heading }: { faqs: Faq[]; heading: string }) {
  if (faqs.length === 0) return null;
  return (
    <section className="wrap grid gap-10 border-t border-line py-20 lg:grid-cols-12 lg:py-28" aria-labelledby="faq">
      <div className="lg:col-span-4">
        <RevealTitle id="faq" text={heading} />
        <p className="mt-5 max-w-[34ch] text-stone">
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
          <CtaLink href="/faq" className="mt-6">
            All questions
          </CtaLink>
        )}
      </div>
    </section>
  );
}

export function NewsletterBand({ newsletter }: { newsletter: SiteSettings["newsletter"] }) {
  return (
    <section className="bg-bone" aria-labelledby="newsletter">
      <div className="wrap grid items-end gap-8 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div>
          <RevealTitle id="newsletter" text={newsletter.headline} />
          <p className="mt-4 text-stone">{newsletter.copy}</p>
        </div>
        <div className="lg:pb-1">
          <NewsletterForm source="homepage" />
        </div>
      </div>
    </section>
  );
}
