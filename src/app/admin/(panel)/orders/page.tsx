import Link from "next/link";
import { and, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import { releaseStaleCardReservations } from "@/lib/orders";
import { formatDate, formatNaira } from "@/lib/format";
import { Empty, PageHeader, StatusPill, td, th } from "@/components/admin/ui";
import { orderTone, ORDER_LABEL } from "@/components/admin/order-status";

export const metadata = { title: "Orders" };

const FILTERS = [
  { key: "", label: "All" },
  { key: "unpaid", label: "Awaiting payment" },
  { key: "to-ship", label: "To prepare" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ payment?: string; f?: string; q?: string }> }) {
  await releaseStaleCardReservations();
  const sp = await searchParams;
  const f = sp.payment === "unpaid" ? "unpaid" : (sp.f ?? "");
  const where: SQL[] = [];
  if (f === "unpaid") where.push(eq(schema.orders.paymentStatus, "unpaid"), sql`${schema.orders.status} <> 'cancelled'`);
  if (f === "to-ship") where.push(eq(schema.orders.paymentStatus, "paid"), sql`${schema.orders.status} in ('pending','processing')`);
  if (f === "shipped") where.push(eq(schema.orders.status, "shipped"));
  if (f === "delivered") where.push(eq(schema.orders.status, "delivered"));
  if (f === "cancelled") where.push(eq(schema.orders.status, "cancelled"));
  const q = sp.q?.trim();
  if (q) {
    const t = `%${q}%`;
    where.push(or(like(schema.orders.reference, t), like(schema.orders.email, t), like(schema.orders.firstName, t), like(schema.orders.lastName, t), like(schema.orders.phone, t))!);
  }
  const orders = await db.select().from(schema.orders).where(where.length ? and(...where) : undefined).orderBy(desc(schema.orders.createdAt)).limit(200);

  return (
    <>
      <PageHeader title="Orders" description="Bank-transfer orders hold their stock until you mark them paid or cancel them. Unpaid card checkouts are released automatically after 2 hours." />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((x) => (
            <Link key={x.key} href={x.key ? `/admin/orders?f=${x.key}` : "/admin/orders"} className={`px-3 py-1.5 text-[13.5px] ${f === x.key ? "bg-espresso text-ivory" : "border border-line hover:border-espresso"}`}>
              {x.label}
            </Link>
          ))}
        </div>
        <form className="flex">
          {f && <input type="hidden" name="f" value={f} />}
          <input name="q" defaultValue={q} placeholder="Reference, name, email or phone" className="field !min-h-10 w-72 !py-1.5 text-[14px]" />
        </form>
      </div>
      {orders.length === 0 ? (
        <Empty>No orders here yet.</Empty>
      ) : (
        <div className="overflow-x-auto border border-line bg-ivory">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Order</th>
                <th className={th}>Date</th>
                <th className={th}>Customer</th>
                <th className={th}>Payment</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-paper">
                  <td className={td}>
                    <Link href={`/admin/orders/${o.id}`} className="tabular font-medium underline underline-offset-4">
                      {o.reference}
                    </Link>
                  </td>
                  <td className={`${td} text-stone`}>{formatDate(o.createdAt)}</td>
                  <td className={td}>
                    {o.firstName} {o.lastName}
                    <div className="text-[12px] text-stone">{o.state}</div>
                  </td>
                  <td className={`${td} text-[13px]`}>{o.paymentMethod === "paystack" ? "Paystack" : "Bank transfer"}</td>
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
    </>
  );
}
