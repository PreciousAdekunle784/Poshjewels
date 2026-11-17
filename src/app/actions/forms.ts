"use server";

import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string> } | null;

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.").max(200);

export async function subscribeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  // Honeypot: real visitors never fill this hidden field.
  if (formData.get("company")) return { ok: true, message: "You're on the list." };
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const source = String(formData.get("source") ?? "site").slice(0, 40);
  const existing = await db.query.subscribers.findFirst({ where: eq(schema.subscribers.email, parsed.data) });
  if (existing) return { ok: true, message: "You're already subscribed. Thank you." };
  await db.insert(schema.subscribers).values({ email: parsed.data, source });
  return { ok: true, message: "You're on the list. Thank you for subscribing." };
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: emailSchema,
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters).").max(4000),
});

export async function contactAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("company")) return { ok: true, message: "Message sent." };
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }
  await db.insert(schema.contactMessages).values({ ...parsed.data, phone: parsed.data.phone || null });
  return { ok: true, message: "Message sent. We'll reply to your email as soon as we can." };
}

const reviewSchema = z.object({
  productId: z.coerce.number().int().positive(),
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: emailSchema,
  rating: z.preprocess((v) => (v === undefined || v === "" ? 0 : v), z.coerce.number().int().min(1, "Choose a rating.").max(5, "Choose a rating.")),
  body: z.string().trim().min(10, "Write at least 10 characters.").max(2000),
});

/** Reviews are held for approval. They are marked "verified" only if the email has a paid order containing the product. */
export async function submitReviewAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("company")) return { ok: true, message: "Thank you." };
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }
  const { productId, email } = parsed.data;
  const paid = await db
    .select({ id: schema.orders.id })
    .from(schema.orders)
    .innerJoin(schema.orderItems, eq(schema.orderItems.orderId, schema.orders.id))
    .where(and(eq(schema.orders.email, email), eq(schema.orderItems.productId, productId), inArray(schema.orders.paymentStatus, ["paid"])))
    .limit(1);
  await db.insert(schema.reviews).values({ ...parsed.data, verifiedBuyer: paid.length > 0 });
  return { ok: true, message: "Thank you. Your review will appear once it has been checked." };
}
