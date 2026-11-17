import "server-only";
import { and, asc, desc, eq, gte, inArray, like, lte, or, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";

const { products, productImages, productVariants, categories, collections, productCollections } = schema;

export type CardVariant = { id: number; name: string; price: number; stock: number };
export type ProductCardData = {
  id: number;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  label: string | null;
  isDemo: boolean;
  categoryName: string | null;
  images: { url: string; alt: string }[];
  variants: CardVariant[];
  inStock: boolean;
};

export const SORTS = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price, low to high",
  "price-desc": "Price, high to low",
  name: "Alphabetical",
} as const;
export type SortKey = keyof typeof SORTS;

export type ProductQuery = {
  categorySlug?: string;
  collectionSlug?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  featured?: boolean;
  excludeId?: number;
  sort?: SortKey;
  page?: number;
  perPage?: number;
};

const inStockExpr = sql<number>`exists (select 1 from ${productVariants} v where v.product_id = ${products.id} and v.stock > 0)`;

function buildWhere(q: ProductQuery) {
  const where: SQL[] = [eq(products.isPublished, true)];
  if (q.categorySlug) {
    where.push(sql`${products.categoryId} = (select id from ${categories} where slug = ${q.categorySlug})`);
  }
  if (q.collectionSlug) {
    where.push(
      sql`${products.id} in (select pc.product_id from ${productCollections} pc join ${collections} c on c.id = pc.collection_id where c.slug = ${q.collectionSlug})`,
    );
  }
  if (q.q) {
    const term = `%${q.q.trim().replace(/[%_]/g, "")}%`;
    where.push(
      or(
        like(products.name, term),
        like(products.description, term),
        sql`${products.categoryId} in (select id from ${categories} where name like ${term})`,
      )!,
    );
  }
  if (q.minPrice != null && !Number.isNaN(q.minPrice)) where.push(gte(products.price, q.minPrice));
  if (q.maxPrice != null && !Number.isNaN(q.maxPrice)) where.push(lte(products.price, q.maxPrice));
  if (q.inStockOnly) where.push(sql`${inStockExpr}`);
  if (q.newArrival) where.push(eq(products.isNewArrival, true));
  if (q.bestSeller) where.push(eq(products.isBestSeller, true));
  if (q.featured) where.push(eq(products.isFeatured, true));
  if (q.excludeId) where.push(sql`${products.id} <> ${q.excludeId}`);
  return and(...where);
}

function orderFor(sort: SortKey | undefined) {
  switch (sort) {
    case "newest":
      return [desc(products.createdAt), desc(products.id)];
    case "price-asc":
      return [asc(products.price), asc(products.id)];
    case "price-desc":
      return [desc(products.price), asc(products.id)];
    case "name":
      return [asc(products.name)];
    default:
      return [asc(products.sortOrder), desc(products.createdAt), desc(products.id)];
  }
}

export async function hydrateCards(rows: (typeof products.$inferSelect & { categoryName?: string | null })[]): Promise<ProductCardData[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const [imgs, vars] = await Promise.all([
    db.select().from(productImages).where(inArray(productImages.productId, ids)).orderBy(asc(productImages.sortOrder), asc(productImages.id)),
    db.select().from(productVariants).where(inArray(productVariants.productId, ids)).orderBy(asc(productVariants.sortOrder), asc(productVariants.id)),
  ]);
  return rows.map((p) => {
    const variants = vars
      .filter((v) => v.productId === p.id)
      .map((v) => ({ id: v.id, name: v.name, price: v.priceOverride ?? p.price, stock: v.stock }));
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      compareAtPrice: p.compareAtPrice && p.compareAtPrice > p.price ? p.compareAtPrice : null,
      label: p.label,
      isDemo: p.isDemo,
      categoryName: p.categoryName ?? null,
      images: imgs.filter((i) => i.productId === p.id).map((i) => ({ url: i.url, alt: i.alt || p.name })),
      variants,
      inStock: variants.some((v) => v.stock > 0),
    };
  });
}

export async function listProducts(q: ProductQuery = {}) {
  const perPage = q.perPage ?? 12;
  const page = Math.max(1, q.page ?? 1);
  const where = buildWhere(q);
  const [rows, [{ count }]] = await Promise.all([
    db
      .select({ p: products, categoryName: categories.name })
      .from(products)
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .where(where)
      .orderBy(...orderFor(q.sort))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db.select({ count: sql<number>`count(*)` }).from(products).where(where),
  ]);
  const items = await hydrateCards(rows.map((r) => ({ ...r.p, categoryName: r.categoryName })));
  return { items, total: Number(count), page, perPage, pageCount: Math.max(1, Math.ceil(Number(count) / perPage)) };
}

export async function priceBounds() {
  const [r] = await db
    .select({ min: sql<number>`coalesce(min(${products.price}), 0)`, max: sql<number>`coalesce(max(${products.price}), 0)` })
    .from(products)
    .where(eq(products.isPublished, true));
  return { min: Number(r.min), max: Number(r.max) };
}

export async function getProductBySlug(slug: string) {
  const row = await db
    .select({ p: products, category: categories })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(and(eq(products.slug, slug), eq(products.isPublished, true)))
    .limit(1);
  if (!row[0]) return null;
  const [card] = await hydrateCards([{ ...row[0].p, categoryName: row[0].category?.name }]);
  return { ...card, description: row[0].p.description, details: row[0].p.details, category: row[0].category, categoryId: row[0].p.categoryId };
}

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getCategory(slug: string) {
  return db.query.categories.findFirst({ where: eq(categories.slug, slug) });
}

export async function getCollections() {
  return db.select().from(collections).where(eq(collections.isPublished, true)).orderBy(asc(collections.sortOrder), asc(collections.name));
}

export async function getCollection(slug: string) {
  return db.query.collections.findFirst({ where: and(eq(collections.slug, slug), eq(collections.isPublished, true)) });
}

export async function getProductsByIds(ids: number[]) {
  if (ids.length === 0) return [];
  const rows = await db
    .select({ p: products, categoryName: categories.name })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(and(inArray(products.id, ids), eq(products.isPublished, true)));
  const cards = await hydrateCards(rows.map((r) => ({ ...r.p, categoryName: r.categoryName })));
  return ids.map((id) => cards.find((c) => c.id === id)).filter(Boolean) as ProductCardData[];
}

export async function getApprovedReviews(opts: { productId?: number; homepage?: boolean; limit?: number }) {
  const where: SQL[] = [eq(schema.reviews.status, "approved")];
  if (opts.productId) where.push(eq(schema.reviews.productId, opts.productId));
  if (opts.homepage) where.push(eq(schema.reviews.showOnHomepage, true));
  return db
    .select({ r: schema.reviews, productName: products.name, productSlug: products.slug })
    .from(schema.reviews)
    .leftJoin(products, eq(products.id, schema.reviews.productId))
    .where(and(...where))
    .orderBy(desc(schema.reviews.createdAt))
    .limit(opts.limit ?? 20);
}

export async function getFaqs() {
  return db.select().from(schema.faqs).where(eq(schema.faqs.isPublished, true)).orderBy(asc(schema.faqs.sortOrder), asc(schema.faqs.id));
}
