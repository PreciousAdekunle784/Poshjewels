import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";

function cell(v: string) {
  // Quote, and neutralise spreadsheet formulas.
  const safe = /^[=+\-@]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await getSession();
  if (session?.role !== "admin") return new Response("Not found", { status: 404 });
  const subs = await db.select().from(schema.subscribers).orderBy(desc(schema.subscribers.createdAt));
  const rows = [["email", "source", "subscribed_at"], ...subs.map((s) => [s.email, s.source ?? "", s.createdAt.toISOString()])];
  const csv = rows.map((r) => r.map(cell).join(",")).join("\n");
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="posh-jewel-subscribers.csv"` },
  });
}
