"use server";

import { resolveLines } from "@/lib/cart-lines";
import { getProductsByIds } from "@/lib/catalog";

export async function refreshCartAction(lines: { variantId: number; quantity: number }[]) {
  if (!Array.isArray(lines) || lines.length > 100) return [];
  return resolveLines(lines);
}

export async function wishlistProductsAction(ids: number[]) {
  if (!Array.isArray(ids)) return [];
  const clean = ids.map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 100);
  return getProductsByIds(clean);
}
