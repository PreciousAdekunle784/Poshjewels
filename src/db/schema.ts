import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text, index, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
};

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const collections = sqliteTable("collections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
});

export const products = sqliteTable(
  "products",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    details: text("details").notNull().default(""),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
    /** Whole naira. */
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),
    label: text("label"),
    isNewArrival: integer("is_new_arrival", { mode: "boolean" }).notNull().default(false),
    isBestSeller: integer("is_best_seller", { mode: "boolean" }).notNull().default(false),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
    /** Sample listing seeded for preview; the owner replaces these with real inventory. */
    isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (t) => [index("products_category_idx").on(t.categoryId)],
);

export const productImages = sqliteTable(
  "product_images",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("images_product_idx").on(t.productId)],
);

export const productVariants = sqliteTable(
  "product_variants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    /** e.g. "Gold tone", "Size 7". A product with a single variant named "Default" shows no selector. */
    name: text("name").notNull(),
    sku: text("sku"),
    priceOverride: integer("price_override"),
    stock: integer("stock").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("variants_product_idx").on(t.productId)],
);

export const productCollections = sqliteTable(
  "product_collections",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    collectionId: integer("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.productId, t.collectionId] })],
);

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["customer", "admin"] }).notNull().default("customer"),
  ...timestamps,
});

export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
export const PAYMENT_STATUSES = ["unpaid", "paid", "failed", "refunded"] as const;

export const orders = sqliteTable(
  "orders",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    reference: text("reference").notNull().unique(),
    /** Random token so a guest can view their own confirmation page. */
    accessToken: text("access_token").notNull(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    note: text("note"),
    subtotal: integer("subtotal").notNull(),
    shippingFee: integer("shipping_fee").notNull(),
    total: integer("total").notNull(),
    status: text("status", { enum: ORDER_STATUSES }).notNull().default("pending"),
    paymentMethod: text("payment_method", { enum: ["paystack", "bank_transfer"] }).notNull(),
    paymentStatus: text("payment_status", { enum: PAYMENT_STATUSES }).notNull().default("unpaid"),
    paymentReference: text("payment_reference"),
    paidAt: integer("paid_at", { mode: "timestamp" }),
    /** Stock is returned to inventory once when an order is cancelled. */
    stockRestored: integer("stock_restored", { mode: "boolean" }).notNull().default(false),
    adminNote: text("admin_note"),
    ...timestamps,
  },
  (t) => [index("orders_email_idx").on(t.email), index("orders_user_idx").on(t.userId)],
);

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  variantId: integer("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(),
  variantName: text("variant_name"),
  imageUrl: text("image_url"),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  rating: integer("rating").notNull(),
  body: text("body").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  /** True when the reviewer's email matches a paid order containing this product. */
  verifiedBuyer: integer("verified_buyer", { mode: "boolean" }).notNull().default(false),
  showOnHomepage: integer("show_on_homepage", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
});

export const faqs = sqliteTable("faqs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
});

export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  source: text("source"),
  ...timestamps,
});

export const contactMessages = sqliteTable("contact_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  handled: integer("handled", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
});

export const pages = sqliteTable("pages", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const paymentEvents = sqliteTable(
  "payment_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    provider: text("provider").notNull(),
    reference: text("reference").notNull(),
    event: text("event").notNull(),
    payload: text("payload").notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex("payment_events_unique").on(t.provider, t.reference, t.event)],
);

export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
