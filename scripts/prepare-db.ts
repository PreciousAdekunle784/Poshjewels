/**
 * Prepares the database. Runs automatically before every Vercel build (`vercel-build`), and locally
 * with `npm run db:setup`.
 *
 *  1. Applies pending migrations from ./drizzle (safe to run repeatedly).
 *  2. Seeds categories, collections, FAQs, draft pages and sample products ONLY into a brand-new,
 *     empty database — so sample products you remove never come back on the next deploy.
 *  3. Creates the first admin from ADMIN_EMAIL + ADMIN_PASSWORD if no admin exists yet.
 *     (It never changes an existing admin's password.)
 */
import { execSync } from "node:child_process";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as schema from "../src/db/schema";
import { assertUsableDatabase, dbAuthToken, dbUrl } from "../src/db/config";

async function main() {
  assertUsableDatabase();
  if (dbUrl.startsWith("file:")) {
    const fs = await import("node:fs");
    fs.mkdirSync("./data", { recursive: true });
  }
  const db = drizzle(createClient({ url: dbUrl, authToken: dbAuthToken }), { schema });
  const where = dbUrl.startsWith("file:") ? dbUrl : dbUrl.replace(/\/\/([^.]+)\..*/, "//$1…");

  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log(`[db] migrations applied (${where})`);

  const seededFlag = await db.query.settings.findFirst({ where: eq(schema.settings.key, "_seeded") });
  if (!seededFlag) {
    const categories = await db.$count(schema.categories);
    if (categories === 0 && !process.argv.includes("--no-seed")) {
      console.log("[db] new database: adding starter content and sample products");
      execSync("npx tsx scripts/seed.ts", { stdio: "inherit", env: process.env });
    }
    await db.insert(schema.settings).values({ key: "_seeded", value: JSON.stringify({ at: new Date().toISOString() }) }).onConflictDoNothing();
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const admins = await db.$count(schema.users, eq(schema.users.role, "admin"));
  if (admins === 0) {
    if (email && password && password.length >= 10) {
      const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
      const passwordHash = await bcrypt.hash(password, 12);
      if (existing) await db.update(schema.users).set({ role: "admin", passwordHash }).where(eq(schema.users.id, existing.id));
      else await db.insert(schema.users).values({ email, passwordHash, name: "Store owner", role: "admin" });
      console.log(`[db] admin account created for ${email}`);
    } else {
      console.warn("[db] no admin account yet: set ADMIN_EMAIL and ADMIN_PASSWORD (10+ characters) and redeploy, or run `npm run admin:create`.");
    }
  }
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error("[db] setup failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  },
);
