import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { dbAuthToken, dbUrl, isTemporaryStorage, LOCAL_DB_FILE, TEMP_DB_PATH } from "./config";

function resolveUrl() {
  if (!isTemporaryStorage) return dbUrl;
  // Temporary mode: copy the starter database built during deployment into /tmp once per instance.
  if (!fs.existsSync(TEMP_DB_PATH)) {
    const bundled = path.join(/*turbopackIgnore: true*/ process.cwd(), LOCAL_DB_FILE);
    if (fs.existsSync(bundled)) fs.copyFileSync(bundled, TEMP_DB_PATH);
    else console.error(`[db] starter database not found at ${bundled}; the store will be empty.`);
  }
  return `file:${TEMP_DB_PATH}`;
}

function connect() {
  return drizzle(createClient({ url: resolveUrl(), authToken: dbAuthToken }), { schema });
}

type Db = ReturnType<typeof connect>;
const globalForDb = globalThis as unknown as { __poshDb?: Db };

/**
 * The connection opens on first use, not when this module is imported. `next build` imports every
 * route while collecting page data; nothing should touch the database at that point.
 */
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const instance = (globalForDb.__poshDb ??= connect());
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export { schema };
