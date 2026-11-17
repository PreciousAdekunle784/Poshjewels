import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { formatDate, formatNaira } from "@/lib/format";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

const STATUS: Record<string, string> = { pending: "Received", processing: "Being prepared", shipped: "On its way", delivered: "Delivered", cancelled: "Cancelled" };

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/account/login");
  const orders = await db.select().from(schema.orders).where(eq(schema.orders.userId, session.userId)).orderBy(desc(schema.orders.createdAt));
  return (
    <div className="wrap pb-24 pt-10 lg:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display t-title">Hello{session.name ? `, ${session.name.split(" ")[0]}` : ""}.</h1>
          <p className="mt-2 text-stone">{session.email}</p>
        </div>
        <div className="flex gap-3">
          {session.role === "admin" && (
            <Link href="/admin" className="btn btn-outline">
              Admin dashboard
            </Link>
          )}
          <form action={logoutAction}>
            <button className="btn btn-outline">Sign out</button>
          </form>
        </div>
      </div>
      <h2 className="label mt-14 border-b border-line pb-3">Your orders</h2>
      {orders.length === 0 ? (
        <div className="py-10">
          <p className="text-stone">You haven&rsquo;t placed any orders with this account yet.</p>
          <Link href="/shop" className="btn btn-solid mt-6">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/order/${o.reference}`} className="grid grid-cols-2 gap-2 py-5 hover:bg-paper sm:grid-cols-4 sm:items-center">
                <span className="tabular">{o.reference}</span>
                <span className="text-stone">{formatDate(o.createdAt)}</span>
                <span>{STATUS[o.status]}{o.paymentStatus !== "paid" && o.status !== "cancelled" ? " · awaiting payment" : ""}</span>
                <span className="tabular sm:text-right">{formatNaira(o.total)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
