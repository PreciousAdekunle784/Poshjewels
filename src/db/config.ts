/**
 * Database location. Locally this is a SQLite file. In production it should be a Turso/libSQL
 * database: set DATABASE_URL + DATABASE_AUTH_TOKEN, or connect Turso from the Vercel Marketplace
 * (it sets TURSO_DATABASE_URL + TURSO_AUTH_TOKEN, possibly with a custom prefix — any are found).
 *
 * If a Vercel deployment has no database connected, the store still runs in TEMPORARY mode: the
 * build creates a starter database that ships with the deployment, and each server instance works
 * on its own copy in /tmp. Browsing, the bag and the admin all work, but changes and orders are
 * not kept permanently. Connecting Turso switches to permanent storage on the next deploy.
 */
function findEnv(test: (name: string, value: string) => boolean) {
  for (const [name, value] of Object.entries(process.env)) {
    if (value && test(name, value)) return value;
  }
  return undefined;
}

export const LOCAL_DB_FILE = "data/posh.db";

export const configuredDbUrl =
  process.env.DATABASE_URL ||
  process.env.TURSO_DATABASE_URL ||
  findEnv((name, value) => /TURSO.*URL$/i.test(name) || /^libsql:\/\//i.test(value)) ||
  undefined;

export const dbAuthToken =
  process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || findEnv((name) => /TURSO.*TOKEN$/i.test(name)) || undefined;

export const dbUrl = configuredDbUrl ?? `file:./${LOCAL_DB_FILE}`;

/** True on Vercel when no permanent database is connected (see the note above). */
export const isTemporaryStorage = Boolean(process.env.VERCEL) && dbUrl.startsWith("file:");

/** Where the per-instance working copy lives in temporary mode (the only writable path on Vercel). */
export const TEMP_DB_PATH = "/tmp/posh-jewel.db";
