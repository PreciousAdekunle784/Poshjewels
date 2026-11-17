import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Wordmark } from "@/components/layout/wordmark";

export const metadata = { title: { default: "Admin", template: "%s · Admin · Posh Jewel" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const [pendingOrders, pendingReviews, newMessages] = await Promise.all([
    db.$count(schema.orders, eq(schema.orders.status, "pending")),
    db.$count(schema.reviews, eq(schema.reviews.status, "pending")),
    db.$count(schema.contactMessages, eq(schema.contactMessages.handled, false)),
  ]);
  return (
    <div className="min-h-svh bg-paper text-[14.5px]">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <AdminNav variant="mobile" badges={{ "/admin/orders": pendingOrders, "/admin/reviews": pendingReviews, "/admin/messages": newMessages }} />
          <Link href="/admin" className="hidden lg:block">
            <Wordmark className="text-[17px]" />
          </Link>
          <span className="label hidden text-[10px] text-stone lg:inline">Admin</span>
        </div>
        <div className="flex items-center gap-4 text-[13.5px]">
          <span className="hidden text-stone sm:inline">{session.email}</span>
          <Link href="/" target="_blank" className="underline underline-offset-4">
            View store
          </Link>
          <form action={logoutAction}>
            <button className="underline underline-offset-4">Sign out</button>
          </form>
        </div>
      </header>
      <div className="lg:grid lg:grid-cols-[230px_1fr]">
        <aside className="hidden border-r border-line px-4 py-6 lg:block">
          <div className="sticky top-20">
            <AdminNav variant="desktop" badges={{ "/admin/orders": pendingOrders, "/admin/reviews": pendingReviews, "/admin/messages": newMessages }} />
          </div>
        </aside>
        <main className="min-w-0 px-4 py-6 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
