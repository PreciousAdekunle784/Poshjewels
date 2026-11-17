/**
 * Prepares the database. Runs automatically before every Vercel build (`vercel-build`), and locally
 * with `npm run db:setup`.
 *
 *  1. Applies pending migrations from ./drizzle (safe to run repeatedly).
 *  2. Seeds starter content and sample products ONLY into a brand-new, empty database, so sample
 *     products you remove never come back on the next deploy.
 *  3. Admin login: if ADMIN_EMAIL + ADMIN_PASSWORD are set, that account is created or updated as an
 *     admin with that password (the variables are the source of truth). If they are not set and no
 *     admin exists yet, an admin is generated and its login is printed in the (private) build log.
 *  4. If SESSION_SECRET is not set, writes a random one to data/session-secret, which ships with the
 *     deployment, so sign-in works without extra setup.
 *
 * With no Turso database on Vercel, this builds the starter database that ships with the deployment
 * (temporary mode — see src/db/config.ts) instead of failing.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import { execSync } from "node:child_process";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as schema from "../src/db/schema";
import { dbAuthToken, dbUrl, isTemporaryStorage } from "../src/db/config";

async function main() {
  const local = dbUrl.startsWith("file:");
  if (local) fs.mkdirSync("./data", { recursive: true });
  const client = createClient({ url: dbUrl, authToken: dbAuthToken });
  const db = drizzle(client, { schema });
  const where = local ? dbUrl : dbUrl.replace(/\/\/([^.]+)\..*/, "//$1…");

  if (isTemporaryStorage) {
    console.warn(
      "[db] No Turso database is connected, so this deployment uses TEMPORARY storage: the store works, but admin changes and orders are not kept permanently.\n" +
        "[db] To make them permanent: Vercel → project → Storage → Turso → Connect Project (tick Production and Preview), then redeploy.",
    );
  }

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

  // Admin login
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 10) {
      console.warn("[db] ADMIN_PASSWORD must be at least 10 characters; the admin account was not changed.");
    } else {
      const passwordHash = await bcrypt.hash(password, 12);
      const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
      if (existing) await db.update(schema.users).set({ role: "admin", passwordHash }).where(eq(schema.users.id, existing.id));
      else await db.insert(schema.users).values({ email, passwordHash, name: "Store owner", role: "admin" });
      console.log(`[db] admin sign-in ready for ${email} (password from ADMIN_PASSWORD)`);
    }
  } else if ((await db.$count(schema.users, eq(schema.users.role, "admin"))) === 0) {
    const generatedEmail = "owner@poshjewel.admin";
    const generatedPassword = crypto.randomBytes(9).toString("base64url");
    await db
      .insert(schema.users)
      .values({ email: generatedEmail, passwordHash: await bcrypt.hash(generatedPassword, 12), name: "Store owner", role: "admin" })
      .onConflictDoNothing();
    console.log(
      `[db] ──────────────────────────────────────────────\n` +
        `[db] Admin sign-in (generated — set ADMIN_EMAIL and ADMIN_PASSWORD in Vercel to choose your own):\n` +
        `[db]   page:     /admin\n[db]   email:    ${generatedEmail}\n[db]   password: ${generatedPassword}\n` +
        `[db] ──────────────────────────────────────────────`,
    );
  }

  // Session secret
  if (!process.env.SESSION_SECRET && !fs.existsSync("./data/session-secret")) {
    fs.mkdirSync("./data", { recursive: true });
    fs.writeFileSync("./data/session-secret", crypto.randomBytes(48).toString("hex"), { mode: 0o600 });
    console.log("[db] SESSION_SECRET not set: generated one for this deployment (sign-ins reset on each deploy until you set it).");
  }

  // Fold any write-ahead log into the main file so the starter database ships complete.
  if (local) await client.execute("PRAGMA wal_checkpoint(TRUNCATE)").catch(() => {});
  client.close();
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error("[db] setup failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  },
);
