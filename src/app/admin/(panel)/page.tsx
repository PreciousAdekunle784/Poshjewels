import Link from "next/link";
import { and, desc, eq, gte, lte, ne, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSettings } from "@/lib/settings";
import { paystackEnabled } from "@/lib/paystack";
import { isTemporaryStorage } from "@/db/config";
import { useBlob } from "@/lib/uploads";
import { formatDate, formatNaira } from "@/lib/format";
import { PageHeader, Panel, StatusPill, td, th } from "@/components/admin/ui";
import { orderTone, ORDER_LABEL } from "@/components/admin/order-status";

export const metadata = { title: "Overview" };

export default async function AdminHome() {
  const since = new Date(Date.now() - 30 * 86400 * 1000);
  const [settings, [sales], awaiting, recent, lowStock, demoCount, pendingReviews, unread] = await Promise.all([
    getSettings(["bank", "contact"]),
    db
      .select({ total: sql<number>`coalesce(sum(${schema.orders.total}),0)`, count: sql<number>`count(*)` })
      .from(schema.orders)
      .where(and(eq(schema.orders.paymentStatus, "paid"), gte(schema.orders.createdAt, since))),
    db.$count(schema.orders, and(eq(schema.orders.paymentStatus, "unpaid"), ne(schema.orders.status, "cancelled"))),
    db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).limit(8),
    db
      .select({ variant: schema.productVariants, productName: schema.products.name, productId: schema.products.id })
      .from(schema.productVariants)
      .innerJoin(schema.products, eq(schema.products.id, schema.productVariants.productId))
      .where(and(lte(schema.productVariants.stock, 2), eq(schema.products.isPublished, true)))
      .orderBy(schema.productVariants.stock)
      .limit(10),
    db.$count(schema.products, eq(schema.products.isDemo, true)),
    db.$count(schema.reviews, eq(schema.reviews.status, "pending")),
    db.$count(schema.contactMessages, eq(schema.contactMessages.handled, false)),
  ]);

  const checklist = [
    { done: !isTemporaryStorage, text: "Connect a permanent database (Vercel → Storage → Turso), then redeploy", href: null },
    { done: !process.env.VERCEL || useBlob, text: "Connect photo storage (Vercel → Storage → Blob), then redeploy", href: null },
    { done: demoCount === 0, text: `Replace the ${demoCount} sample products with your real pieces`, href: "/admin/products" },
    { done: paystackEnabled(), text: "Connect Paystack for card payments (add PAYSTACK_SECRET_KEY to the server environment)", href: null },
    { done: !settings.bank.enabled || !!settings.bank.accountNumber, text: "Add your bank details for bank-transfer orders", href: "/admin/settings#bank" },
    { done: !!(settings.contact.email || settings.contact.phone), text: "Add your contact email or phone number", href: "/admin/settings#contact" },
    { done: false, text: "Review the delivery fees, returns policy and other policy pages", href: "/admin/pages", optional: true },
  ];

  return (
    <>
      <PageHeader title="Overview" />
      {checklist.some((c) => !c.done && !c.optional) && (
        <Panel title="Before you launch" className="mb-6">
          <ul className="grid gap-2.5">
            {checklist.map((c) => (
              <li key={c.text} className="flex items-start gap-3">
                <span className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center border text-[10px] ${c.done ? "border-moss bg-moss text-ivory" : "border-stone"}`} aria-hidden>
                  {c.done ? "✓" : ""}
                </span>
                <span className={c.done ? "text-stone line-through" : ""}>
                  {c.href && !c.done ? (
                    <Link href={c.href} className="underline underline-offset-4">
                      {c.text}
                    </Link>
                  ) : (
                    c.text
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Paid sales, last 30 days", value: formatNaira(Number(sales.total)), sub: `${sales.count} orders` },
          { label: "Awaiting payment", value: String(awaiting), href: "/admin/orders?payment=unpaid" },
          { label: "Reviews to check", value: String(pendingReviews), href: "/admin/reviews" },
          { label: "Unanswered messages", value: String(unread), href: "/admin/messages" },
        ].map((s) => (
          <div key={s.label} className="border border-line bg-ivory p-5">
            <p className="text-[12.5px] text-stone">{s.label}</p>
            <p className="tabular mt-1 text-[24px]">{s.value}</p>
            {s.sub && <p className="text-[12.5px] text-stone">{s.sub}</p>}
            {s.href && (
              <Link href={s.href} className="text-[12.5px] underline underline-offset-4">
                View
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Latest orders" actions={<Link href="/admin/orders" className="text-[13px] underline underline-offset-4">All orders</Link>}>
          {recent.length === 0 ? (
            <p className="text-stone">No orders yet.</p>
          ) : (
            <div className="-mx-5 -my-5 overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead className="border-b border-line">
                  <tr>
                    <th className={th}>Order</th>
                    <th className={th}>Customer</th>
                    <th className={th}>Status</th>
                    <th className={`${th} text-right`}>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {recent.map((o) => (
                    <tr key={o.id} className="hover:bg-paper">
                      <td className={td}>
                        <Link href={`/admin/orders/${o.id}`} className="tabular underline underline-offset-4">
                          {o.reference}
                        </Link>
                        <div className="text-[12px] text-stone">{formatDate(o.createdAt)}</div>
                      </td>
                      <td className={td}>
                        {o.firstName} {o.lastName}
                      </td>
                      <td className={td}>
                        <StatusPill tone={orderTone(o)}>{ORDER_LABEL(o)}</StatusPill>
                      </td>
                      <td className={`${td} tabular text-right`}>{formatNaira(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        <Panel title="Low stock">
          {lowStock.length === 0 ? (
            <p className="text-stone">Every published option has 3 or more in stock.</p>
          ) : (
            <ul className="divide-y divide-line">
              {lowStock.map((l) => (
                <li key={l.variant.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/products/${l.productId}`} className="underline-offset-4 hover:underline">
                    {l.productName}
                    {l.variant.name !== "Default" && <span className="text-stone"> · {l.variant.name}</span>}
                  </Link>
                  <StatusPill tone={l.variant.stock === 0 ? "bad" : "warn"}>{l.variant.stock === 0 ? "Sold out" : `${l.variant.stock} left`}</StatusPill>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
