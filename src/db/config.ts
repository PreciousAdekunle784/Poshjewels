/**
 * Database location. Locally this is a SQLite file. In production it is a Turso/libSQL database:
 * set DATABASE_URL + DATABASE_AUTH_TOKEN, or connect Turso from the Vercel Marketplace, which sets
 * TURSO_DATABASE_URL + TURSO_AUTH_TOKEN (both naming schemes are accepted).
 */
export const dbUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || "file:./data/posh.db";
export const dbAuthToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined;

export function assertUsableDatabase() {
  if (process.env.VERCEL && dbUrl.startsWith("file:")) {
    throw new Error(
      "No database configured. Vercel has no persistent disk: connect a Turso database (Vercel → Storage / Marketplace → Turso) or set DATABASE_URL and DATABASE_AUTH_TOKEN.",
    );
  }
}
