import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { dbAuthToken, dbUrl } from "./config";

const globalForDb = globalThis as unknown as { __poshClient?: ReturnType<typeof createClient> };

const client = globalForDb.__poshClient ?? createClient({ url: dbUrl, authToken: dbAuthToken });

if (process.env.NODE_ENV !== "production") globalForDb.__poshClient = client;

export const db = drizzle(client, { schema });
export { schema };
