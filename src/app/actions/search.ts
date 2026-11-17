"use server";

import { listProducts } from "@/lib/catalog";

export async function searchSuggestAction(q: string) {
  const term = String(q ?? "").trim().slice(0, 60);
  if (term.length < 2) return [];
  const { items } = await listProducts({ q: term, perPage: 6 });
  return items.map((p) => ({ slug: p.slug, name: p.name, price: p.price, image: p.images[0]?.url ?? null, category: p.categoryName }));
}
