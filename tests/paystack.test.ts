/**
 * Exercises Paystack verification against a mocked Paystack API (no network, no real keys).
 * Run: npm run test:payments
 */
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";

process.env.PAYSTACK_SECRET_KEY = "sk_test_mock_for_unit_tests_only";
process.env.DATABASE_URL = "file:./data/test-payments.db";

async function main() {
  const { execSync } = await import("node:child_process");
  const fs = await import("node:fs");
  fs.rmSync("./data/test-payments.db", { force: true });
  execSync("npx drizzle-kit push --force", { env: { ...process.env }, stdio: "ignore" });

  const { db, schema } = await import("../src/db");
  const { createOrder, confirmPaystackPayment } = await import("../src/lib/orders");
  const { validWebhookSignature } = await import("../src/lib/paystack");
  const { DEFAULT_SETTINGS } = await import("../src/lib/settings");

  const [cat] = await db.insert(schema.categories).values({ slug: "rings", name: "Rings" }).returning();
  const [prod] = await db.insert(schema.products).values({ slug: "t", name: "Test Ring", price: 20000, categoryId: cat.id }).returning();
  const [variant] = await db.insert(schema.productVariants).values({ productId: prod.id, name: "Default", stock: 5 }).returning();

  const line = { variantId: variant.id, productId: prod.id, slug: "t", name: "Test Ring", variantName: null, price: 20000, image: null, stock: 5, quantity: 2, isDemo: false };
  const input = { email: "a@b.co", phone: "08000000000", firstName: "A", lastName: "B", address: "1 Road", city: "Ikeja", state: "Lagos", paymentMethod: "paystack" as const };

  let mock: { status: string; amount: number; currency?: string } = { status: "success", amount: 0 };
  globalThis.fetch = (async (url: string) => {
    assert.match(String(url), /api\.paystack\.co\/transaction\/verify\//);
    return new Response(JSON.stringify({ status: true, data: { status: mock.status, reference: "x", amount: mock.amount, currency: mock.currency ?? "NGN", paid_at: new Date().toISOString() } }), { status: 200 });
  }) as typeof fetch;

  // 1. Correct amount → paid, stock reserved once
  const o1 = await createOrder(input, [line], { ...DEFAULT_SETTINGS.shipping });
  assert.equal(o1.total, 43000, "subtotal 40,000 + Lagos 3,000");
  await db.update(schema.orders).set({ paymentReference: "REF-1" }).where(eq(schema.orders.id, o1.id));
  mock = { status: "success", amount: 43000 * 100 };
  const r1 = await confirmPaystackPayment("REF-1");
  assert.equal(r1.ok, true);
  const paid = await db.query.orders.findFirst({ where: eq(schema.orders.id, o1.id) });
  assert.equal(paid?.paymentStatus, "paid");
  assert.equal(paid?.status, "processing");
  const v = await db.query.productVariants.findFirst({ where: eq(schema.productVariants.id, variant.id) });
  assert.equal(v?.stock, 3);
  // Idempotent
  assert.equal((await confirmPaystackPayment("REF-1")).ok, true);

  // 2. Wrong amount → not paid
  const o2 = await createOrder(input, [{ ...line, stock: 3, quantity: 1 }], { ...DEFAULT_SETTINGS.shipping });
  await db.update(schema.orders).set({ paymentReference: "REF-2" }).where(eq(schema.orders.id, o2.id));
  mock = { status: "success", amount: 100 };
  const r2 = await confirmPaystackPayment("REF-2");
  assert.equal(r2.ok, false);
  assert.equal((await db.query.orders.findFirst({ where: eq(schema.orders.id, o2.id) }))?.paymentStatus, "unpaid");

  // 3. Failed charge → marked failed
  mock = { status: "failed", amount: o2.total * 100 };
  await confirmPaystackPayment("REF-2");
  assert.equal((await db.query.orders.findFirst({ where: eq(schema.orders.id, o2.id) }))?.paymentStatus, "failed");

  // 4. Cannot oversell: 2 left, ask for 3
  await assert.rejects(createOrder(input, [{ ...line, stock: 99, quantity: 3 }], { ...DEFAULT_SETTINGS.shipping }), /no longer available/);

  // 5. Webhook signatures
  const body = JSON.stringify({ event: "charge.success", data: { reference: "REF-1" } });
  const sig = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!).update(body).digest("hex");
  assert.equal(validWebhookSignature(body, sig), true);
  assert.equal(validWebhookSignature(body + " ", sig), false);
  assert.equal(validWebhookSignature(body, null), false);

  fs.rmSync("./data/test-payments.db", { force: true });
  console.log("✓ Paystack verification, amount checks, idempotency, oversell guard and webhook signatures all pass");
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
