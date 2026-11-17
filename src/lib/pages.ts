import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";

export async function getPage(slug: string) {
  return db.query.pages.findFirst({ where: eq(schema.pages.slug, slug) });
}
