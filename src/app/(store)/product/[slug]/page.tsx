import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedReviews, getProductBySlug, listProducts } from "@/lib/catalog";
import { getSetting } from "@/lib/settings";
import { formatDate, formatNaira, paragraphs } from "@/lib/format";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { Gallery } from "@/components/product/gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { ReviewForm } from "@/components/product/review-form";
import { ProductCard } from "@/components/product/product-card";
import { PlusIcon } from "@/components/icons";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return {};
  const description = product.description.slice(0, 155);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title: product.name, description, images: product.images.slice(0, 1).map((i) => i.url) },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const [shipping, reviews, related] = await Promise.all([
    getSetting("shipping"),
    getApprovedReviews({ productId: product.id, limit: 20 }),
    listProducts({ categorySlug: product.category?.slug, excludeId: product.id, perPage: 4 }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => `${SITE_URL}${i.url}`),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/product/${product.slug}`,
    },
  };

  const info = [
    { title: "Description", body: product.description, open: true },
    product.details && { title: "Details", body: product.details },
    {
      title: "Delivery",
      body: `${shipping.deliveryNote}\n\nDelivery within Lagos: ${formatNaira(shipping.lagosFee)}. Other states: ${formatNaira(shipping.otherStatesFee)}.${
        shipping.freeShippingThreshold > 0 ? ` Free delivery on orders over ${formatNaira(shipping.freeShippingThreshold)}.` : ""
      }`,
      link: { href: "/pages/shipping", label: "Shipping & delivery" },
    },
    {
      title: "Returns & care",
      body: "Put jewellery on after perfume and lotion, and take it off before swimming, bathing or exercise. Store pieces separately in a dry pouch.",
      link: { href: "/pages/returns", label: "Returns & exchanges" },
    },
  ].filter(Boolean) as { title: string; body: string; open?: boolean; link?: { href: string; label: string } }[];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="wrap pb-20 pt-4 lg:pt-8">
        <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-stone">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/shop" className="hover:underline">
                Shop
              </Link>
            </li>
            {product.category && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link href={`/shop/${product.category.slug}`} className="hover:underline">
                    {product.category.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-espresso">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          <div className="lg:col-span-7">
            <Gallery images={product.images} name={product.name} productId={product.id} />
          </div>

          <div className="lg:col-span-5">
            <div className="max-w-[480px] lg:sticky lg:top-[140px]">
              {product.label && <p className="label text-champagne">{product.label}</p>}
              <h1 className="display t-title mt-2">{product.name}</h1>
              {product.isDemo && (
                <p className="mt-3 border-l-2 border-champagne pl-3 text-[12.5px] leading-snug text-stone">
                  Sample listing for preview. Photograph, price and stock are placeholders until the real piece is added.
                </p>
              )}
              <PurchasePanel product={product} />

              <div className="mt-10 border-t border-line">
                {info.map((s) => (
                  <details key={s.title} className="group border-b border-line" open={s.open}>
                    <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[15px] [&::-webkit-details-marker]:hidden">
                      {s.title}
                      <PlusIcon size={16} className="transition-transform group-open:rotate-45" />
                    </summary>
                    <div className="prose-posh pb-5 text-[14.5px] leading-relaxed text-stone">
                      {paragraphs(s.body).map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                      {s.link && (
                        <p>
                          <Link href={s.link.href} className="link text-espresso">
                            {s.link.label}
                          </Link>
                        </p>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-20 grid gap-10 border-t border-line pt-14 lg:grid-cols-12" aria-labelledby="product-reviews">
          <div className="lg:col-span-4">
            <h2 id="product-reviews" className="display text-[40px]">
              Reviews
            </h2>
            <p className="mt-2 text-stone">
              {reviews.length === 0 ? "No reviews yet. If you own this piece, tell others what you think." : `${reviews.length} ${reviews.length === 1 ? "review" : "reviews"} from customers.`}
            </p>
          </div>
          <div className="lg:col-span-8">
            {reviews.length > 0 && (
              <ul className="mb-10 divide-y divide-line border-y border-line">
                {reviews.map(({ r }) => (
                  <li key={r.id} className="py-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-[13.5px]">
                      <p>
                        <span className="font-medium">{r.name}</span>
                        {r.verifiedBuyer && <span className="text-stone"> · Verified buyer</span>}
                      </p>
                      <p className="text-stone">
                        Rated {r.rating} of 5 · {formatDate(r.createdAt)}
                      </p>
                    </div>
                    <p className="mt-3 max-w-[65ch] leading-relaxed">{r.body}</p>
                  </li>
                ))}
              </ul>
            )}
            <ReviewForm productId={product.id} />
          </div>
        </section>

        {related.items.length > 0 && (
          <section className="mt-20" aria-labelledby="related">
            <h2 id="related" className="display mb-9 text-[40px]">
              You may also like
            </h2>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-4 lg:gap-x-5">
              {related.items.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
