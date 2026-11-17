import type { Config } from "drizzle-kit";
import { dbAuthToken, dbUrl } from "./src/db/config";

export default (dbAuthToken
  ? { schema: "./src/db/schema.ts", out: "./drizzle", dialect: "turso", dbCredentials: { url: dbUrl, authToken: dbAuthToken } }
  : { schema: "./src/db/schema.ts", out: "./drizzle", dialect: "sqlite", dbCredentials: { url: dbUrl } }) satisfies Config;
