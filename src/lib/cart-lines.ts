import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";

export type ResolvedLine = {
  variantId: number;
  productId: number;
  slug: string;
  name: string;
  variantName: string | null;
  price: number;
  image: string | null;
  stock: number;
  quantity: number;
  isDemo: boolean;
};

/**
 * Resolves cart lines against the database. Prices, names and stock always come from here —
 * never from the browser — so totals cannot be tampered with.
 */
export async function resolveLines(lines: { variantId: number; quantity: number }[]): Promise<ResolvedLine[]> {
  const clean = lines
    .map((l) => ({ variantId: Math.trunc(Number(l.variantId)), quantity: Math.max(1, Math.min(99, Math.trunc(Number(l.quantity)) || 1)) }))
    .filter((l) => Number.isFinite(l.variantId) && l.variantId > 0);
  if (clean.length === 0) return [];
  const ids = [...new Set(clean.map((l) => l.variantId))];
  const rows = await db
    .select({ v: schema.productVariants, p: schema.products })
    .from(schema.productVariants)
    .innerJoin(schema.products, eq(schema.products.id, schema.productVariants.productId))
    .where(and(inArray(schema.productVariants.id, ids), eq(schema.products.isPublished, true)));
  const productIds = [...new Set(rows.map((r) => r.p.id))];
  const images = productIds.length
    ? await db.select().from(schema.productImages).where(inArray(schema.productImages.productId, productIds)).orderBy(asc(schema.productImages.sortOrder), asc(schema.productImages.id))
    : [];
  const out: ResolvedLine[] = [];
  for (const line of clean) {
    const row = rows.find((r) => r.v.id === line.variantId);
    if (!row) continue;
    const existing = out.find((o) => o.variantId === line.variantId);
    if (existing) {
      existing.quantity += line.quantity;
      continue;
    }
    const variantCount = await countVariants(row.p.id);
    out.push({
      variantId: row.v.id,
      productId: row.p.id,
      slug: row.p.slug,
      name: row.p.name,
      variantName: variantCount > 1 || row.v.name !== "Default" ? row.v.name : null,
      price: row.v.priceOverride ?? row.p.price,
      image: images.find((i) => i.productId === row.p.id)?.url ?? null,
      stock: row.v.stock,
      quantity: line.quantity,
      isDemo: row.p.isDemo,
    });
  }
  return out;
}

const variantCountCache = new Map<number, number>();
async function countVariants(productId: number) {
  if (variantCountCache.has(productId)) return variantCountCache.get(productId)!;
  const n = await db.$count(schema.productVariants, eq(schema.productVariants.productId, productId));
  variantCountCache.set(productId, n);
  setTimeout(() => variantCountCache.delete(productId), 30_000);
  return n;
}
