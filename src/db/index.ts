import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { assertUsableDatabase, dbAuthToken, dbUrl } from "./config";

function connect() {
  assertUsableDatabase();
  return drizzle(createClient({ url: dbUrl, authToken: dbAuthToken }), { schema });
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
