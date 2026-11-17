/**
 * Create (or reset the password of) an admin user.
 *   npm run admin:create -- owner@example.com "a-strong-password" "Owner Name"
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as schema from "../src/db/schema";

async function main() {
  const [email, password, name = "Admin"] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Usage: npm run admin:create -- <email> <password> ["Name"]');
    process.exit(1);
  }
  if (password.length < 10) {
    console.error("Use a password of at least 10 characters.");
    process.exit(1);
  }
  const db = drizzle(createClient({ url: process.env.DATABASE_URL ?? "file:./data/posh.db", authToken: process.env.DATABASE_AUTH_TOKEN || undefined }), { schema });
  const passwordHash = await bcrypt.hash(password, 12);
  const normalized = email.trim().toLowerCase();
  const existing = await db.query.users.findFirst({ where: eq(schema.users.email, normalized) });
  if (existing) {
    await db.update(schema.users).set({ passwordHash, role: "admin", name }).where(eq(schema.users.id, existing.id));
    console.log(`Updated ${normalized}: now an admin with the new password.`);
  } else {
    await db.insert(schema.users).values({ email: normalized, passwordHash, name, role: "admin" });
    console.log(`Created admin ${normalized}.`);
  }
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
