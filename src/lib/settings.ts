import "server-only";
import { db, schema } from "@/db";
import { inArray } from "drizzle-orm";

/**
 * Every piece of editable site copy lives here with a sensible default.
 * Admin edits are stored per key in the `settings` table and merged over these defaults.
 */
export const DEFAULT_SETTINGS = {
  announcement: {
    enabled: true,
    text: "Orders are processed within 2 working days",
    link: "",
  },
  hero: {
    headline: "The art of wearing *beauty*.",
    copy: "Jewellery that speaks without saying a word. Find the pieces that reflect your style and make every moment feel special.",
    primaryLabel: "Shop the collection",
    primaryHref: "/shop",
    secondaryLabel: "Explore new arrivals",
    secondaryHref: "/collections/new-arrivals",
    image: "/demo/hero-chain-portrait.jpg",
    imageAlt: "Model wearing a gold link chain necklace and matching bracelet",
    secondaryImage: "/demo/hero-layered-portrait.jpg",
    secondaryImageAlt: "Fine layered necklaces worn with an open white shirt",
  },
  featured: {
    enabled: true,
    eyebrow: "The layering edit",
    headline: "Fine chains, worn together.",
    copy: "Delicate necklaces chosen to sit at different lengths, so they can be stacked, mixed and worn every day.",
    ctaLabel: "Shop the edit",
    collectionSlug: "the-layering-edit",
    image: "/demo/feature-layering.jpg",
    imageAlt: "Two fine gold-tone necklaces layered over an olive top",
  },
  editorial: {
    enabled: true,
    headline: "Beauty in every *detail*.",
    body: "We choose each piece for the way it catches the light, sits against the skin and lives alongside the rest of your jewellery box.\n\nSome pieces are made for the everyday. Others are kept for the moments you will remember. All of them are chosen to be worn, not just admired.",
    ctaLabel: "About Posh Jewel",
    ctaHref: "/about",
    imageA: "/demo/about-portrait.jpg",
    imageAAlt: "Model in a black top wearing a fine pendant necklace and a ring",
    imageB: "/demo/about-palm.jpg",
    imageBAlt: "A hand holding several fine pendant necklaces",
  },
  sections: {
    newArrivalsHeading: "Just arrived",
    newArrivalsCopy: "Fresh pieces worth making room for.",
    bestSellersHeading: "The Posh favourites",
    bestSellersCopy: "The pieces our customers keep coming back for.",
    reviewsHeading: "In their words",
    faqHeading: "Questions, answered",
  },
  newsletter: {
    headline: "A little Posh in your inbox.",
    copy: "New arrivals and restocks, before anyone else. No noise.",
  },
  brand: {
    footerDescription: "Jewellery chosen for the way it makes you feel. Necklaces, earrings, bracelets and rings for every day and every occasion.",
  },
  contact: {
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    hours: "",
    instagram: "",
    tiktok: "",
  },
  shipping: {
    lagosFee: 3000,
    otherStatesFee: 6000,
    freeShippingThreshold: 0,
    deliveryNote: "Orders are processed within 2 working days. Lagos deliveries usually arrive 1–3 working days after dispatch; other states 3–7 working days.",
  },
  bank: {
    enabled: true,
    bankName: "",
    accountName: "",
    accountNumber: "",
    instructions: "Transfer the order total and use your order reference as the payment description. Your order is confirmed once payment is received.",
  },
} as const;

type Widen<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : { -readonly [K in keyof T]: Widen<T[K]> };
export type SiteSettings = Widen<typeof DEFAULT_SETTINGS>;
export type SettingsKey = keyof SiteSettings;

export async function getSettings<K extends SettingsKey>(keys: K[]): Promise<Pick<SiteSettings, K>> {
  const rows = await db.select().from(schema.settings).where(inArray(schema.settings.key, keys as string[]));
  const out = {} as Pick<SiteSettings, K>;
  for (const key of keys) {
    const row = rows.find((r) => r.key === key);
    let stored: Record<string, unknown> = {};
    if (row) {
      try {
        stored = JSON.parse(row.value);
      } catch {
        stored = {};
      }
    }
    out[key] = { ...(DEFAULT_SETTINGS[key] as object), ...stored } as SiteSettings[K];
  }
  return out;
}

export async function getSetting<K extends SettingsKey>(key: K): Promise<SiteSettings[K]> {
  const s = await getSettings([key]);
  return s[key];
}

export async function saveSetting<K extends SettingsKey>(key: K, value: SiteSettings[K]) {
  const json = JSON.stringify(value);
  await db
    .insert(schema.settings)
    .values({ key, value: json })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: json } });
}
