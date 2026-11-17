/**
 * Database location. Locally this is a SQLite file. In production it is a Turso/libSQL database:
 * set DATABASE_URL + DATABASE_AUTH_TOKEN, or connect Turso from the Vercel Marketplace (it sets
 * TURSO_DATABASE_URL + TURSO_AUTH_TOKEN, possibly with a custom prefix — any of these are found).
 */
function findEnv(test: (name: string, value: string) => boolean) {
  for (const [name, value] of Object.entries(process.env)) {
    if (value && test(name, value)) return value;
  }
  return undefined;
}

export const dbUrl =
  process.env.DATABASE_URL ||
  process.env.TURSO_DATABASE_URL ||
  findEnv((name, value) => /TURSO.*URL$/i.test(name) || /^libsql:\/\//i.test(value)) ||
  "file:./data/posh.db";

export const dbAuthToken =
  process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || findEnv((name) => /TURSO.*TOKEN$/i.test(name)) || undefined;

export function assertUsableDatabase() {
  if (!process.env.VERCEL || !dbUrl.startsWith("file:")) return;
  // Name what *is* configured (never values) so a misconnected store is easy to spot.
  const related = Object.keys(process.env)
    .filter((k) => /DATABASE|TURSO|LIBSQL|POSTGRES|PG|NEON|SUPABASE|MYSQL|BLOB/i.test(k) && !/^npm_/i.test(k))
    .sort();
  const hasPostgres = related.some((k) => /POSTGRES|NEON|SUPABASE|^PG/i.test(k));
  throw new Error(
    [
      `No database configured for this ${process.env.VERCEL_ENV ?? "Vercel"} build. Vercel has no persistent disk, so the store needs a Turso database.`,
      "Fix: Vercel → your project → Storage → Turso → Connect Project, with this environment ticked (Production and Preview). Or set DATABASE_URL and DATABASE_AUTH_TOKEN.",
      hasPostgres ? "Note: a Postgres database is connected, but this store uses Turso (SQLite), not Postgres." : "",
      `Related variables visible to this build: ${related.length ? related.join(", ") : "none"}.`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
}
