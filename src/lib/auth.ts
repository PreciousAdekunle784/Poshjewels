import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";

const COOKIE = "pj_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

let cachedFileSecret: string | null | undefined;
function fileSecret() {
  if (cachedFileSecret === undefined) {
    try {
      cachedFileSecret = fs.readFileSync(path.join(/*turbopackIgnore: true*/ process.cwd(), "data/session-secret"), "utf8").trim() || null;
    } catch {
      cachedFileSecret = null;
    }
  }
  return cachedFileSecret;
}

/**
 * Signing key for sign-in cookies: SESSION_SECRET, or the random secret generated at deploy time
 * (data/session-secret) when the variable isn't set. Returns null only if neither exists in production.
 */
function secretKey(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32 ? process.env.SESSION_SECRET : fileSecret();
  if (secret) return new TextEncoder().encode(secret);
  if (process.env.NODE_ENV !== "production") return new TextEncoder().encode("development-only-secret-do-not-use-in-production!!");
  return null;
}

export class AuthNotConfiguredError extends Error {
  constructor() {
    super("Sign-in isn't set up on this deployment yet. Add SESSION_SECRET in the hosting settings and redeploy.");
  }
}

export type Session = { userId: number; role: "customer" | "admin"; email: string; name: string };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: { id: number; role: "customer" | "admin"; email: string; name: string }) {
  const key = secretKey();
  if (!key) throw new AuthNotConfiguredError();
  const token = await new SignJWT({ role: user.role, email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  const key = secretKey();
  if (!token || !key) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    const userId = Number(payload.sub);
    if (!userId) return null;
    // Re-check the user still exists and has the same role (e.g. admin access revoked).
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
    if (!user) return null;
    return { userId: user.id, role: user.role, email: user.email, name: user.name };
  } catch {
    return null;
  }
}

/** Use in every admin page, layout and server action. */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");
  return session;
}

/** Very small in-memory throttle for login attempts (per process). */
const attempts = new Map<string, { count: number; first: number }>();
export function tooManyAttempts(key: string, limit = 8, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > windowMs) {
    attempts.set(key, { count: 1, first: now });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}
export function clearAttempts(key: string) {
  attempts.delete(key);
}
