import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { __poshClient?: ReturnType<typeof createClient> };

const client =
  globalForDb.__poshClient ??
  createClient({
    url: process.env.DATABASE_URL ?? "file:./data/posh.db",
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  });

if (process.env.NODE_ENV !== "production") globalForDb.__poshClient = client;

export const db = drizzle(client, { schema });
export { schema };
