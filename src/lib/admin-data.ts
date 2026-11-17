import "server-only";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";

export async function editorOptions() {
  const [categories, collections] = await Promise.all([
    db.select({ id: schema.categories.id, name: schema.categories.name }).from(schema.categories).orderBy(asc(schema.categories.sortOrder)),
    db.select({ id: schema.collections.id, name: schema.collections.name }).from(schema.collections).orderBy(asc(schema.collections.sortOrder)),
  ]);
  return { categories, collections };
}
