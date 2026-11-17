import type { Config } from "drizzle-kit";

const url = process.env.DATABASE_URL ?? "file:./data/posh.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

export default (authToken
  ? { schema: "./src/db/schema.ts", out: "./drizzle", dialect: "turso", dbCredentials: { url, authToken } }
  : { schema: "./src/db/schema.ts", out: "./drizzle", dialect: "sqlite", dbCredentials: { url } }) satisfies Config;
