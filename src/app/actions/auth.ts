"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { AuthNotConfiguredError, clearAttempts, createSession, destroySession, hashPassword, tooManyAttempts, verifyPassword } from "@/lib/auth";

// Compared against when the email is unknown, so response time does not reveal which emails exist.
const DUMMY_HASH = "$2b$12$wlrLOZ/xSVCnGTUdd8iEoeLQ1FW.mVMH3V/iPrqYKpa2iKqqqG.l.";

export type AuthState = { message: string; errors?: Record<string, string> } | null;

function safeNext(next: FormDataEntryValue | null, fallback: string) {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : fallback;
}

async function clientKey(email: string) {
  const h = await headers();
  return `${h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"}:${email}`;
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const adminOnly = formData.get("admin") === "1";
  const key = await clientKey(email);
  if (tooManyAttempts(key)) return { message: "Too many attempts. Please wait 15 minutes and try again." };
  const user = email ? await db.query.users.findFirst({ where: eq(schema.users.email, email) }) : undefined;
  const ok = user ? await verifyPassword(password, user.passwordHash) : await verifyPassword(password, DUMMY_HASH);
  if (!user || !ok) return { message: "That email and password don't match." };
  if (adminOnly && user.role !== "admin") return { message: "This account doesn't have admin access." };
  clearAttempts(key);
  try {
    await createSession(user);
  } catch (e) {
    if (e instanceof AuthNotConfiguredError) return { message: e.message };
    throw e;
  }
  redirect(safeNext(formData.get("next"), adminOnly ? "/admin" : "/account"));
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200),
  password: z.string().min(8, "Use at least 8 characters.").max(200),
});

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { message: "Please check the highlighted fields.", errors };
  }
  const { name, email, password } = parsed.data;
  const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  if (existing) return { message: "An account with this email already exists. Sign in instead.", errors: { email: "Already registered." } };
  const [user] = await db.insert(schema.users).values({ name, email, passwordHash: await hashPassword(password), role: "customer" }).returning();
  try {
    await createSession(user);
  } catch (e) {
    if (e instanceof AuthNotConfiguredError) return { message: "Your account was created. " + e.message };
    throw e;
  }
  // Earlier guest orders are not attached automatically: email ownership is not verified.
  redirect(safeNext(formData.get("next"), "/account"));
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
