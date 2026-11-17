"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { and, eq, inArray, notInArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { cancelOrder } from "@/lib/orders";
import { DEFAULT_SETTINGS, getSetting, saveSetting, type SettingsKey, type SiteSettings } from "@/lib/settings";
import { deleteImage, saveImage } from "@/lib/uploads";

export type ActionResult = { ok: boolean; message: string } | null;

function refreshStore() {
  revalidatePath("/", "layout");
}

/* ───────────────────────── Images ───────────────────────── */

export async function uploadImagesAction(formData: FormData): Promise<{ urls: string[]; errors: string[] }> {
  await requireAdmin();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const folder = formData.get("folder") === "content" ? "content" : "products";
  const urls: string[] = [];
  const errors: string[] = [];
  for (const f of files.slice(0, 12)) {
    try {
      urls.push(await saveImage(f, folder));
    } catch (e) {
      errors.push((e as Error).message);
    }
  }
  return { urls, errors };
}

/* ───────────────────────── Products ───────────────────────── */

const productPayload = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(2, "Add a product name.").max(120),
  slug: z.string().trim().max(80).optional(),
  description: z.string().trim().max(5000),
  details: z.string().trim().max(5000),
  categoryId: z.number().int().positive().nullable(),
  price: z.number().int("Price must be a whole naira amount.").min(0).max(100_000_000),
  compareAtPrice: z.number().int().min(0).max(100_000_000).nullable(),
  label: z.string().trim().max(30).nullable(),
  isPublished: z.boolean(),
  isNewArrival: z.boolean(),
  isBestSeller: z.boolean(),
  isFeatured: z.boolean(),
  collectionIds: z.array(z.number().int().positive()),
  images: z.array(z.object({ url: z.string().min(1).max(500), alt: z.string().max(200) })).max(20),
  variants: z
    .array(
      z.object({
        id: z.number().int().positive().optional(),
        name: z.string().trim().min(1, "Every option needs a name.").max(60),
        sku: z.string().trim().max(60).nullable(),
        priceOverride: z.number().int().min(0).nullable(),
        stock: z.number().int().min(0, "Stock can't be negative.").max(100000),
      }),
    )
    .min(1, "Add at least one option (use “Default” for a single version).")
    .max(50),
});
export type ProductPayload = z.infer<typeof productPayload>;

export async function saveProductAction(payload: ProductPayload): Promise<{ ok: boolean; message: string; id?: number }> {
  await requireAdmin();
  const parsed = productPayload.safeParse(payload);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const p = parsed.data;
  const imgOk = p.images.every((i) => i.url.startsWith("/media/") || i.url.startsWith("/demo/"));
  if (!imgOk) return { ok: false, message: "Images must be uploaded through the dashboard." };

  let slug = slugify(p.slug || p.name) || `piece-${Date.now()}`;
  const clash = await db.query.products.findFirst({ where: eq(schema.products.slug, slug) });
  if (clash && clash.id !== p.id) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const values = {
    name: p.name,
    slug,
    description: p.description,
    details: p.details,
    categoryId: p.categoryId,
    price: p.price,
    compareAtPrice: p.compareAtPrice && p.compareAtPrice > p.price ? p.compareAtPrice : null,
    label: p.label || null,
    isPublished: p.isPublished,
    isNewArrival: p.isNewArrival,
    isBestSeller: p.isBestSeller,
    isFeatured: p.isFeatured,
    updatedAt: new Date(),
  };

  let removedImages: string[] = [];
  const id = await db.transaction(async (tx) => {
    let productId = p.id;
    if (productId) {
      const existing = await tx.query.products.findFirst({ where: eq(schema.products.id, productId) });
      if (!existing) throw new Error("Product not found.");
      // Editing a sample listing turns it into a real one.
      await tx.update(schema.products).set({ ...values, isDemo: false }).where(eq(schema.products.id, productId));
    } else {
      const [row] = await tx.insert(schema.products).values(values).returning();
      productId = row.id;
    }

    const oldImages = await tx.select().from(schema.productImages).where(eq(schema.productImages.productId, productId));
    const keep = new Set(p.images.map((i) => i.url));
    removedImages = oldImages.filter((i) => !keep.has(i.url)).map((i) => i.url);
    await tx.delete(schema.productImages).where(eq(schema.productImages.productId, productId));
    if (p.images.length) {
      await tx.insert(schema.productImages).values(p.images.map((img, i) => ({ productId: productId!, url: img.url, alt: img.alt, sortOrder: i })));
    }

    // Variants: update in place (keeps order history links), insert new, delete removed.
    const keptIds = p.variants.map((v) => v.id).filter(Boolean) as number[];
    if (keptIds.length) {
      await tx.delete(schema.productVariants).where(and(eq(schema.productVariants.productId, productId), notInArray(schema.productVariants.id, keptIds)));
    } else {
      await tx.delete(schema.productVariants).where(eq(schema.productVariants.productId, productId));
    }
    for (const [i, v] of p.variants.entries()) {
      const row = { name: v.name, sku: v.sku || null, priceOverride: v.priceOverride, stock: v.stock, sortOrder: i };
      if (v.id) await tx.update(schema.productVariants).set(row).where(and(eq(schema.productVariants.id, v.id), eq(schema.productVariants.productId, productId)));
      else await tx.insert(schema.productVariants).values({ ...row, productId });
    }

    await tx.delete(schema.productCollections).where(eq(schema.productCollections.productId, productId));
    if (p.collectionIds.length) {
      await tx.insert(schema.productCollections).values(p.collectionIds.map((collectionId) => ({ productId: productId!, collectionId })));
    }
    return productId;
  });

  for (const url of removedImages) await deleteImage(url);
  refreshStore();
  return { ok: true, message: "Product saved.", id };
}

export async function deleteProductAction(id: number) {
  await requireAdmin();
  const imgs = await db.select().from(schema.productImages).where(eq(schema.productImages.productId, id));
  await db.delete(schema.productCollections).where(eq(schema.productCollections.productId, id));
  await db.delete(schema.productImages).where(eq(schema.productImages.productId, id));
  await db.delete(schema.reviews).where(eq(schema.reviews.productId, id));
  // Order history keeps product name, price and image; links are cleared.
  await db.update(schema.orderItems).set({ productId: null, variantId: null }).where(eq(schema.orderItems.productId, id));
  await db.delete(schema.productVariants).where(eq(schema.productVariants.productId, id));
  await db.delete(schema.products).where(eq(schema.products.id, id));
  for (const i of imgs) await deleteImage(i.url);
  refreshStore();
  redirect("/admin/products?deleted=1");
}

export async function toggleProductFlagAction(id: number, flag: "isPublished" | "isNewArrival" | "isBestSeller" | "isFeatured", value: boolean) {
  await requireAdmin();
  await db.update(schema.products).set({ [flag]: value, updatedAt: new Date() }).where(eq(schema.products.id, id));
  refreshStore();
}

export async function updateStockAction(variantId: number, stock: number) {
  await requireAdmin();
  if (!Number.isInteger(stock) || stock < 0) return;
  await db.update(schema.productVariants).set({ stock }).where(eq(schema.productVariants.id, variantId));
  refreshStore();
}

export async function removeSampleProductsAction(): Promise<ActionResult> {
  await requireAdmin();
  const demo = await db.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.isDemo, true));
  const ids = demo.map((d) => d.id);
  if (ids.length) {
    await db.update(schema.orderItems).set({ productId: null, variantId: null }).where(inArray(schema.orderItems.productId, ids));
    await db.delete(schema.productCollections).where(inArray(schema.productCollections.productId, ids));
    await db.delete(schema.productImages).where(inArray(schema.productImages.productId, ids));
    await db.delete(schema.reviews).where(inArray(schema.reviews.productId, ids));
    await db.delete(schema.productVariants).where(inArray(schema.productVariants.productId, ids));
    await db.delete(schema.products).where(inArray(schema.products.id, ids));
  }
  refreshStore();
  return { ok: true, message: `${ids.length} sample products removed.` };
}

/* ───────────────────────── Categories & collections ───────────────────────── */

const groupSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(2, "Add a name.").max(60),
  slug: z.string().trim().max(60).optional(),
  description: z.string().trim().max(600).optional(),
  imageUrl: z.string().trim().max(500).optional(),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isPublished: z.string().optional(),
});

export async function saveCategoryAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = groupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const d = parsed.data;
  const slug = slugify(d.slug || d.name);
  const clash = await db.query.categories.findFirst({ where: eq(schema.categories.slug, slug) });
  if (clash && clash.id !== d.id) return { ok: false, message: `Another category already uses the address /shop/${slug}.` };
  const values = { name: d.name, slug, description: d.description || null, imageUrl: d.imageUrl || null, sortOrder: d.sortOrder };
  if (d.id) await db.update(schema.categories).set(values).where(eq(schema.categories.id, d.id));
  else await db.insert(schema.categories).values(values);
  refreshStore();
  return { ok: true, message: d.id ? "Category updated." : "Category added." };
}

export async function deleteCategoryAction(id: number) {
  await requireAdmin();
  await db.update(schema.products).set({ categoryId: null }).where(eq(schema.products.categoryId, id));
  await db.delete(schema.categories).where(eq(schema.categories.id, id));
  refreshStore();
}

export async function saveCollectionAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = groupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const d = parsed.data;
  const slug = slugify(d.slug || d.name);
  const clash = await db.query.collections.findFirst({ where: eq(schema.collections.slug, slug) });
  if (clash && clash.id !== d.id) return { ok: false, message: `Another collection already uses the address /collections/${slug}.` };
  const values = { name: d.name, slug, description: d.description || null, imageUrl: d.imageUrl || null, sortOrder: d.sortOrder, isPublished: d.isPublished === "on" };
  if (d.id) await db.update(schema.collections).set(values).where(eq(schema.collections.id, d.id));
  else await db.insert(schema.collections).values(values);
  refreshStore();
  return { ok: true, message: d.id ? "Collection updated." : "Collection added." };
}

export async function deleteCollectionAction(id: number) {
  await requireAdmin();
  await db.delete(schema.productCollections).where(eq(schema.productCollections.collectionId, id));
  await db.delete(schema.collections).where(eq(schema.collections.id, id));
  refreshStore();
}

/* ───────────────────────── Orders ───────────────────────── */

const orderUpdate = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(schema.ORDER_STATUSES),
  paymentStatus: z.enum(schema.PAYMENT_STATUSES),
  adminNote: z.string().max(2000).optional(),
});

export async function updateOrderAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = orderUpdate.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the order fields." };
  const d = parsed.data;
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, d.id) });
  if (!order) return { ok: false, message: "Order not found." };
  if (order.status === "cancelled" && d.status !== "cancelled") {
    return { ok: false, message: "Cancelled orders can't be re-opened because their stock has been returned. Ask the customer to place a new order." };
  }
  if (d.status === "cancelled" && order.status !== "cancelled") await cancelOrder(order.id);
  await db
    .update(schema.orders)
    .set({
      status: d.status,
      paymentStatus: d.paymentStatus,
      paidAt: d.paymentStatus === "paid" ? (order.paidAt ?? new Date()) : order.paidAt,
      adminNote: d.adminNote || null,
    })
    .where(eq(schema.orders.id, d.id));
  revalidatePath(`/admin/orders/${d.id}`);
  revalidatePath("/admin/orders");
  return { ok: true, message: "Order updated." };
}

/* ───────────────────────── Reviews, FAQs, messages, subscribers ───────────────────────── */

export async function setReviewStatusAction(id: number, status: "approved" | "rejected" | "pending") {
  await requireAdmin();
  await db.update(schema.reviews).set({ status, ...(status !== "approved" ? { showOnHomepage: false } : {}) }).where(eq(schema.reviews.id, id));
  refreshStore();
}
export async function toggleReviewHomepageAction(id: number, value: boolean) {
  await requireAdmin();
  await db.update(schema.reviews).set({ showOnHomepage: value }).where(and(eq(schema.reviews.id, id), eq(schema.reviews.status, "approved")));
  refreshStore();
}
export async function deleteReviewAction(id: number) {
  await requireAdmin();
  await db.delete(schema.reviews).where(eq(schema.reviews.id, id));
  refreshStore();
}

const faqSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  question: z.string().trim().min(5, "Write the question.").max(200),
  answer: z.string().trim().min(5, "Write the answer.").max(3000),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isPublished: z.string().optional(),
});
export async function saveFaqAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = faqSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const { id, isPublished, ...rest } = parsed.data;
  const values = { ...rest, isPublished: isPublished === "on" };
  if (id) await db.update(schema.faqs).set(values).where(eq(schema.faqs.id, id));
  else await db.insert(schema.faqs).values(values);
  refreshStore();
  return { ok: true, message: id ? "Question updated." : "Question added." };
}
export async function deleteFaqAction(id: number) {
  await requireAdmin();
  await db.delete(schema.faqs).where(eq(schema.faqs.id, id));
  refreshStore();
}

export async function setMessageHandledAction(id: number, handled: boolean) {
  await requireAdmin();
  await db.update(schema.contactMessages).set({ handled }).where(eq(schema.contactMessages.id, id));
  revalidatePath("/admin/messages");
}

export async function deleteSubscriberAction(id: number) {
  await requireAdmin();
  await db.delete(schema.subscribers).where(eq(schema.subscribers.id, id));
  revalidatePath("/admin/subscribers");
}

/* ───────────────────────── Pages & settings ───────────────────────── */

export async function savePageAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!slug || title.length < 2) return { ok: false, message: "Add a page title." };
  if (body.length > 30000) return { ok: false, message: "That page is too long." };
  await db.update(schema.pages).set({ title, body, updatedAt: new Date() }).where(eq(schema.pages.slug, slug));
  refreshStore();
  return { ok: true, message: "Page saved." };
}

/**
 * Saves one settings group. Every field is coerced to the type of its default value,
 * and unknown fields are ignored, so the storefront can always rely on the shape.
 */
export async function saveSettingsAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const key = String(formData.get("_key")) as SettingsKey;
  if (!(key in DEFAULT_SETTINGS)) return { ok: false, message: "Unknown settings group." };
  const defaults = DEFAULT_SETTINGS[key] as Record<string, unknown>;
  const current = (await getSetting(key)) as Record<string, unknown>;
  const next: Record<string, unknown> = { ...current };
  for (const [field, def] of Object.entries(defaults)) {
    const raw = formData.get(field);
    if (typeof def === "boolean") next[field] = raw === "on";
    else if (raw === null) continue;
    else if (typeof def === "number") {
      const n = Number(String(raw).replace(/[^\d.]/g, ""));
      if (!Number.isFinite(n) || n < 0) return { ok: false, message: `${field} must be a positive number.` };
      next[field] = Math.round(n);
    } else {
      const s = String(raw).trim();
      if (s.length > 4000) return { ok: false, message: `${field} is too long.` };
      if ((field.toLowerCase().includes("href") || field === "link") && s && !s.startsWith("/") && !/^https:\/\//.test(s)) {
        return { ok: false, message: "Links must start with / (a page on this site) or https://." };
      }
      next[field] = s;
    }
  }
  if (key === "bank" && next.accountNumber && !/^\d{10}$/.test(String(next.accountNumber))) {
    return { ok: false, message: "Nigerian account numbers have 10 digits." };
  }
  await saveSetting(key, next as SiteSettings[typeof key]);
  refreshStore();
  return { ok: true, message: "Saved. Changes are live." };
}
