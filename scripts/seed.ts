/**
 * Seeds categories, collections, FAQs, draft pages and a set of clearly-marked SAMPLE products
 * (is_demo = 1) so the store can be previewed before real inventory is uploaded.
 *
 * Sample prices and stock are placeholders. Delete them from Admin → Products → "Remove sample products".
 *
 * Run:  npm run db:seed          (safe to re-run: it skips anything that already exists)
 *       npm run db:seed -- --reset   (wipes catalogue data first)
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:./data/posh.db",
  authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
});
const db = drizzle(client, { schema });

const CATEGORIES = [
  { slug: "necklaces", name: "Necklaces", imageUrl: "/demo/cat-necklaces.jpg", description: "Pendants, chains and statement pieces, from fine everyday layers to evening collars." },
  { slug: "earrings", name: "Earrings", imageUrl: "/demo/cat-earrings.jpg", description: "Hoops, studs and drops to wear alone or stack." },
  { slug: "bracelets", name: "Bracelets", imageUrl: "/demo/cat-bracelets.jpg", description: "Chains, bangles and sparkling lines for the wrist." },
  { slug: "rings", name: "Rings", imageUrl: "/demo/cat-rings.jpg", description: "Bands, stacking rings and cocktail rings." },
  { slug: "sets", name: "Jewellery Sets", imageUrl: "/demo/cat-sets.jpg", description: "Pieces paired to be worn, and gifted, together." },
];

const COLLECTIONS = [
  { slug: "new-arrivals", name: "New Arrivals", description: "The latest pieces to join the collection.", imageUrl: "/demo/e-twisted-hoops-2.jpg" },
  { slug: "best-sellers", name: "The Posh Favourites", description: "The pieces our customers return to again and again.", imageUrl: "/demo/n-medallion-layers.jpg" },
  { slug: "the-layering-edit", name: "The Layering Edit", description: "Fine chains and pendants chosen to be worn together.", imageUrl: "/demo/feature-layering.jpg" },
  { slug: "evening", name: "After Dark", description: "Pieces with a little more sparkle, for evenings and occasions.", imageUrl: "/demo/n-crystal-collar.jpg" },
];

type Seed = {
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  label?: string;
  images: [string, string][]; // [url, alt]
  variants?: string[];
  description: string;
  details?: string;
  newArrival?: boolean;
  bestSeller?: boolean;
  collections?: string[];
};

const GOLD_SILVER = ["Gold tone", "Silver tone"];
const RING_SIZES = ["Size 6", "Size 7", "Size 8", "Size 9"];

const PRODUCTS: Seed[] = [
  // Necklaces
  { slug: "teal-facet-pendant", name: "Teal Facet Pendant", category: "necklaces", price: 38000, images: [["/demo/n-teal-facet-pendant.jpg", "Faceted teal stone pendant on a fine chain"]], description: "A deep teal faceted stone set in a slim frame, suspended from a fine chain. It catches the light with every movement and sits neatly at the collarbone.", newArrival: true, collections: ["new-arrivals", "evening"] },
  { slug: "crescent-layer-necklace", name: "Crescent Layer Necklace", category: "necklaces", price: 42000, images: [["/demo/n-crescent-layer.jpg", "Layered necklace with a crescent pendant and a small blue stone"]], description: "Two chains in one: a small blue stone on the upper strand and an upturned crescent below. Designed to look layered without the tangle.", bestSeller: true, collections: ["best-sellers", "the-layering-edit"] },
  { slug: "halo-pendant", name: "Halo Pendant", category: "necklaces", price: 45000, images: [["/demo/n-halo-pendant.jpg", "Cushion halo pendant on a box chain"]], description: "A cushion of sparkling stones framed by a halo, hung from a sleek box chain. Polished enough for evenings, simple enough for every day.", variants: ["Silver tone"], collections: ["evening"] },
  { slug: "open-heart-necklace", name: "Open Heart Necklace", category: "necklaces", price: 28000, images: [["/demo/n-open-heart.jpg", "Open heart pendant lined with small stones on a bead chain"]], description: "An open heart outlined in tiny stones on a delicate bead chain. A gentle, easy piece to gift.", bestSeller: true, collections: ["best-sellers"] },
  { slug: "pearl-drop-necklace", name: "Pearl Drop Necklace", category: "necklaces", price: 26000, images: [["/demo/n-pearl-drop.jpg", "Single pearl drop on a fine chain, worn"]], description: "One pearl on a fine chain. Quietly polished, and lovely layered with longer pieces.", newArrival: true, collections: ["new-arrivals", "the-layering-edit"] },
  { slug: "medallion-layered-chains", name: "Medallion Layered Chains", category: "necklaces", price: 52000, images: [["/demo/n-medallion-layers.jpg", "Three layered chains with a round medallion pendant"]], description: "Three chains of different weights and lengths finished with a round medallion. A complete layered look in a single clasp.", bestSeller: true, collections: ["best-sellers", "the-layering-edit"] },
  { slug: "blue-heart-pendant", name: "Blue Heart Pendant", category: "necklaces", price: 34000, images: [["/demo/n-blue-heart.jpg", "Deep blue heart-shaped stone pendant"]], description: "A deep blue heart-cut stone topped with a small sparkling accent, on a fine chain.", collections: ["evening"] },
  { slug: "bar-pendant-layered-necklace", name: "Bar Pendant Layered Necklace", category: "necklaces", price: 36000, images: [["/demo/n-bar-layered.jpg", "Two fine chains with a small disc and a bar pendant, worn"]], description: "A small engraved-look disc above a slim bar pendant. Two lengths, one effortless line.", newArrival: true, collections: ["new-arrivals", "the-layering-edit"] },
  { slug: "tree-of-life-pendant", name: "Tree of Life Pendant", category: "necklaces", price: 24000, images: [["/demo/n-tree-of-life.jpg", "Round tree of life pendant on a fine chain"]], description: "A round pierced tree-of-life pendant on a fine chain.", variants: ["Silver tone"] },
  { slug: "heart-locket-necklace", name: "Heart Charm Necklace", category: "necklaces", price: 22000, images: [["/demo/n-heart-locket.jpg", "Small heart charm on a fine chain held in a hand"]], description: "A small puffed heart charm on a fine chain. Made for everyday wear.", collections: ["the-layering-edit"] },
  { slug: "crystal-collar-necklace", name: "Crystal Collar Necklace", category: "necklaces", price: 68000, images: [["/demo/n-crystal-collar.jpg", "Ornate crystal collar necklace displayed on a black bust"]], description: "An ornate collar of clustered crystals with a single drop at the centre. A statement for weddings and evenings.", variants: ["Silver tone"], label: "Statement", collections: ["evening"] },
  { slug: "pearl-strand", name: "Pearl Strand", category: "necklaces", price: 48000, images: [["/demo/n-pearl-strand.jpg", "Pearl strand necklace presented in an open box"]], description: "A classic strand of evenly matched pearls finished with a sparkling clasp.", variants: ["Default"], bestSeller: true, collections: ["best-sellers", "evening"] },

  // Earrings
  { slug: "twisted-hoops", name: "Twisted Hoops", category: "earrings", price: 26000, images: [["/demo/e-twisted-hoops-1.jpg", "Chunky twisted hoop earrings resting on a stone"], ["/demo/e-twisted-hoops-2.jpg", "Twisted hoop earrings in soft shadow"]], description: "Chunky, rope-twisted hoops with real presence. They catch the light from every angle.", variants: ["Gold tone"], newArrival: true, bestSeller: true, collections: ["new-arrivals", "best-sellers"] },
  { slug: "sculpted-hoops", name: "Sculpted Hoops", category: "earrings", price: 19000, images: [["/demo/e-sculpted-hoops.jpg", "Small sculpted hoop earrings on a pink dish"]], description: "Small, bold hoops with a smooth sculpted finish. The pair you'll reach for every morning.", variants: ["Gold tone"], bestSeller: true, collections: ["best-sellers"] },
  { slug: "blue-stone-drops", name: "Blue Stone Drops", category: "earrings", price: 46000, images: [["/demo/e-blue-stone-drops.jpg", "Drop earrings with blue stones framed in sparkling stones on a leaf"]], description: "A deep blue stone framed in sparkle, hung beneath a matching top. Made for occasions.", variants: ["Silver tone"], label: "Statement", collections: ["evening"] },
  { slug: "flower-cluster-studs", name: "Flower Cluster Studs", category: "earrings", price: 21000, images: [["/demo/e-flower-studs.jpg", "Flower-shaped cluster stud earrings"]], description: "Petal-shaped clusters around a central stone. Pretty, light, and easy to wear.", newArrival: true, collections: ["new-arrivals"] },
  { slug: "blush-teardrop-earrings", name: "Blush Teardrop Earrings", category: "earrings", price: 32000, compareAt: 38000, images: [["/demo/e-blush-teardrop.jpg", "Blush teardrop drop earrings"]], description: "Linear drops ending in a blush-toned teardrop stone. Graceful movement, soft colour.", variants: ["Rose tone"], collections: ["evening"] },
  { slug: "blue-heart-drops", name: "Blue Heart Drops", category: "earrings", price: 18000, images: [["/demo/e-blue-heart-drops.jpg", "Blue heart crystal drop earrings on hooks"]], description: "Faceted blue hearts on simple hooks. A playful pop of colour.", variants: ["Gold tone"] },

  // Bracelets
  { slug: "crystal-link-bracelet", name: "Crystal Link Bracelet", category: "bracelets", price: 44000, images: [["/demo/b-crystal-link.jpg", "Crystal link bracelet on a black background"]], description: "Open links set with sparkling stones, joined into a fluid bracelet that moves with the wrist.", variants: ["Silver tone"], collections: ["evening"] },
  { slug: "chunky-curb-bracelet", name: "Chunky Curb Bracelet", category: "bracelets", price: 35000, images: [["/demo/b-chunky-curb.jpg", "Chunky chain bracelet resting on an open magazine"]], description: "A bold, chunky chain bracelet that holds its own or anchors a stack.", variants: ["Gold tone"], newArrival: true, bestSeller: true, collections: ["new-arrivals", "best-sellers"] },
  { slug: "twisted-bangle-stack", name: "Twisted Bangle Stack", category: "bracelets", price: 30000, images: [["/demo/b-bangle-stack.jpg", "Stack of slim twisted bangles"]], description: "A stack of slim twisted bangles, made to be worn together and heard as you move.", variants: ["Gold tone"] },
  { slug: "rose-crystal-bracelet", name: "Rose Crystal Bracelet", category: "bracelets", price: 39000, images: [["/demo/b-rose-crystal.jpg", "Rose-toned bracelet with crystal-set links on a pink background"]], description: "Interlocking links set with small stones in a soft rose tone.", variants: ["Rose tone"], newArrival: true, collections: ["new-arrivals"] },
  { slug: "tennis-bracelet", name: "Tennis Bracelet", category: "bracelets", price: 55000, images: [["/demo/b-tennis.jpg", "Tennis bracelet with a continuous line of stones"]], description: "A continuous line of sparkling stones with a secure box clasp. A timeless piece.", variants: ["Silver tone"], bestSeller: true, collections: ["best-sellers", "evening"] },
  { slug: "paperclip-chain-bracelet", name: "Paperclip Chain Bracelet", category: "bracelets", price: 24000, images: [["/demo/b-paperclip.jpg", "Paperclip chain bracelet on black fabric"]], description: "Elongated links in a light, modern chain. Easy to stack.", variants: ["Silver tone"] },

  // Rings
  { slug: "stacked-pave-rings", name: "Stacked Pavé Rings", category: "rings", price: 33000, images: [["/demo/r-stacked-pave.jpg", "Three stacked rings with sparkling detail"]], description: "A trio of stacking rings with sparkling detail, designed to sit perfectly together.", variants: RING_SIZES, bestSeller: true, collections: ["best-sellers"] },
  { slug: "crossover-pave-ring", name: "Crossover Pavé Ring", category: "rings", price: 27000, images: [["/demo/r-crossover-pave.jpg", "Crossover ring with sparkling bands"]], description: "Two sparkling bands that sweep across each other. Bold on its own.", variants: RING_SIZES },
  { slug: "blossom-cocktail-ring", name: "Blossom Cocktail Ring", category: "rings", price: 49000, images: [["/demo/r-blossom-cocktail.jpg", "Flower-shaped cocktail ring with purple and yellow stones"]], description: "Purple and golden petals around a sparkling centre. A true cocktail ring.", variants: RING_SIZES, label: "Statement", collections: ["evening"] },
  { slug: "pink-halo-ring", name: "Pink Halo Ring", category: "rings", price: 42000, images: [["/demo/r-pink-halo.jpg", "Ring with a pink centre stone and halo"]], description: "A pink centre stone ringed with sparkle on a slim band.", variants: RING_SIZES, newArrival: true, collections: ["new-arrivals"] },
  { slug: "halo-solitaire-ring", name: "Halo Solitaire Ring", category: "rings", price: 38000, images: [["/demo/r-halo-solitaire.jpg", "Halo solitaire ring on a black stand"]], description: "A round centre stone in a halo with a split, sparkling shoulder.", variants: RING_SIZES },
  { slug: "cluster-ring", name: "Cluster Ring", category: "rings", price: 36000, images: [["/demo/r-cluster.jpg", "Cluster ring with warm-toned stones on linen"]], description: "Warm-toned stones gathered into a domed cluster.", variants: RING_SIZES },
  { slug: "red-stone-ring", name: "Red Stone Ring", category: "rings", price: 31000, images: [["/demo/r-red-stone.jpg", "Ring with a red centre stone resting on pearls"]], description: "A rich red stone in an ornate setting.", variants: RING_SIZES, collections: ["evening"] },
  { slug: "classic-band-pair", name: "Classic Band Pair", category: "rings", price: 29000, images: [["/demo/r-band-pair.jpg", "Two polished bands interlocked"]], description: "Two polished bands to wear together, apart or share.", variants: RING_SIZES },
  { slug: "two-tone-bands", name: "Two-Tone Bands", category: "rings", price: 29000, images: [["/demo/r-two-tone-bands.jpg", "Two-tone polished bands on white fabric"]], description: "A pair of bands with a contrasting two-tone finish.", variants: RING_SIZES },

  // Sets
  { slug: "heritage-necklace-earring-set", name: "Heritage Necklace & Earring Set", category: "sets", price: 85000, images: [["/demo/s-heritage-set.jpg", "Ornate necklace with matching drop earrings set with red stones"]], description: "An ornate collar necklace with matching drop earrings, accented with red stones. Made for celebrations.", variants: ["Default"], label: "Set", collections: ["evening"] },
  { slug: "bar-necklace-cuff-set", name: "Bar Necklace & Cuff Set", category: "sets", price: 58000, images: [["/demo/s-bar-cuff-set.jpg", "Bar pendant necklace and cuff bracelet with a gift box"]], description: "A long bar pendant and a matching studded cuff, presented together.", variants: ["Gold tone"], label: "Set", newArrival: true, collections: ["new-arrivals"] },
  { slug: "ring-stud-set", name: "Ring & Stud Set", category: "sets", price: 47000, images: [["/demo/s-ring-stud-set.jpg", "Three dainty rings and a pair of ball studs in a jewellery box"]], description: "Three dainty rings and a pair of ball studs, ready to gift.", variants: ["Size 6", "Size 7", "Size 8"], label: "Set" },
];

const FAQS = [
  ["How long will my order take to arrive?", "Orders are processed within 2 working days. Once dispatched, deliveries within Lagos usually arrive in 1–3 working days and deliveries to other states in 3–7 working days."],
  ["How much does delivery cost?", "Delivery is calculated at checkout based on your state. You will see the exact fee before you pay."],
  ["How can I pay?", "You can pay by bank transfer, and by card where card payment is shown at checkout. Your order reference appears on your confirmation page."],
  ["Can I track my order?", "Yes. Keep the order reference from your confirmation page. If you created an account, your orders and their status are listed under Account."],
  ["How should I care for my jewellery?", "Put jewellery on after perfume and lotion, take it off before swimming, bathing or exercising, and store each piece separately in a dry pouch so it does not scratch or tangle."],
  ["What is your returns policy?", "Please read our Returns page for the full policy. If something arrives damaged or incorrect, contact us as soon as possible with your order reference."],
];

const PAGES = [
  {
    slug: "about",
    title: "About Posh Jewel",
    body: "Posh Jewel brings together necklaces, earrings, bracelets and rings chosen for the way they look, feel and make you feel.\n\nWe look for pieces that are easy to wear and hard to forget: fine chains for every day, sparkle for the evenings that ask for it, and sets made for gifting.\n\nEvery order is packed with care and sent to you ready to wear, or ready to give.",
  },
  {
    slug: "shipping",
    title: "Shipping & Delivery",
    body: "Orders are processed within 2 working days of payment being confirmed.\n\nDelivery fees are calculated at checkout based on your state. Within Lagos, deliveries usually arrive 1–3 working days after dispatch. Other states usually take 3–7 working days.\n\nYou will receive your order reference at checkout. Please keep it for any questions about your order.",
  },
  {
    slug: "returns",
    title: "Returns & Exchanges",
    body: "If your order arrives damaged or you receive the wrong item, contact us within 48 hours of delivery with your order reference and photos of the item.\n\nFor hygiene reasons, earrings cannot be returned unless faulty.\n\nItems must be unworn and returned in their original packaging. Once we receive and inspect the item, we will let you know whether an exchange or refund can be made.",
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    body: "We collect the details you give us at checkout (name, email, phone number and delivery address) to process and deliver your order and to contact you about it.\n\nIf you subscribe to our newsletter, we use your email address to send you updates. You can ask us to remove you at any time.\n\nCard payments are processed by Paystack. We never see or store your card details.\n\nWe do not sell your personal information.",
  },
  {
    slug: "terms",
    title: "Terms of Service",
    body: "By placing an order you confirm that the details you provide are accurate.\n\nPrices are shown in Nigerian Naira (₦). An order is confirmed once payment has been received.\n\nProduct photographs are for illustration. Colours can appear slightly different depending on your screen.",
  },
];

async function main() {
  const reset = process.argv.includes("--reset");
  if (reset) {
    console.log("Resetting catalogue data…");
    await db.delete(schema.productCollections);
    await db.delete(schema.productImages);
    await db.delete(schema.productVariants);
    await db.delete(schema.reviews);
    await db.delete(schema.products);
    await db.delete(schema.collections);
    await db.delete(schema.categories);
    await db.delete(schema.faqs);
  }

  const catIds = new Map<string, number>();
  for (const [i, c] of CATEGORIES.entries()) {
    const existing = await db.query.categories.findFirst({ where: eq(schema.categories.slug, c.slug) });
    if (existing) {
      catIds.set(c.slug, existing.id);
      continue;
    }
    const [row] = await db.insert(schema.categories).values({ ...c, sortOrder: i }).returning();
    catIds.set(c.slug, row.id);
  }

  const colIds = new Map<string, number>();
  for (const [i, c] of COLLECTIONS.entries()) {
    const existing = await db.query.collections.findFirst({ where: eq(schema.collections.slug, c.slug) });
    if (existing) {
      colIds.set(c.slug, existing.id);
      continue;
    }
    const [row] = await db.insert(schema.collections).values({ ...c, sortOrder: i }).returning();
    colIds.set(c.slug, row.id);
  }

  let created = 0;
  const now = Math.floor(Date.now() / 1000);
  for (const [i, p] of PRODUCTS.entries()) {
    const existing = await db.query.products.findFirst({ where: eq(schema.products.slug, p.slug) });
    if (existing) continue;
    const [row] = await db
      .insert(schema.products)
      .values({
        slug: p.slug,
        name: p.name,
        description: p.description,
        details: p.details ?? "",
        categoryId: catIds.get(p.category)!,
        price: p.price,
        compareAtPrice: p.compareAt ?? null,
        label: p.label ?? null,
        isNewArrival: !!p.newArrival,
        isBestSeller: !!p.bestSeller,
        isFeatured: (p.collections ?? []).includes("the-layering-edit"),
        isDemo: true,
        sortOrder: i,
        // Stagger creation dates so "Newest" sorting is meaningful.
        createdAt: new Date((now - (PRODUCTS.length - i) * 3600 - (p.newArrival ? 0 : 86400 * 30)) * 1000),
      })
      .returning();
    await db.insert(schema.productImages).values(p.images.map(([url, alt], j) => ({ productId: row.id, url, alt, sortOrder: j })));
    const variants = p.variants ?? GOLD_SILVER;
    await db.insert(schema.productVariants).values(
      variants.map((name, j) => ({ productId: row.id, name, stock: 10, sortOrder: j, sku: `SAMPLE-${row.id}-${j + 1}` })),
    );
    const cols = p.collections ?? [];
    if (cols.length) {
      await db.insert(schema.productCollections).values(cols.map((c) => ({ productId: row.id, collectionId: colIds.get(c)! })));
    }
    created++;
  }

  const faqCount = await db.$count(schema.faqs);
  if (faqCount === 0) {
    await db.insert(schema.faqs).values(FAQS.map(([question, answer], i) => ({ question, answer, sortOrder: i })));
  }

  for (const page of PAGES) {
    await db.insert(schema.pages).values(page).onConflictDoNothing();
  }

  console.log(`Seed complete: ${created} sample products created.`);
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
