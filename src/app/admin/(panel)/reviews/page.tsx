import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { deleteReviewAction, setReviewStatusAction, toggleReviewHomepageAction } from "@/app/admin/actions";
import { ActionButton } from "@/components/admin/forms";
import { Empty, PageHeader, StatusPill } from "@/components/admin/ui";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Reviews" };

export default async function ReviewsAdmin() {
  const rows = await db
    .select({ r: schema.reviews, productName: schema.products.name, productSlug: schema.products.slug })
    .from(schema.reviews)
    .leftJoin(schema.products, eq(schema.products.id, schema.reviews.productId))
    .orderBy(desc(schema.reviews.createdAt));
  return (
    <>
      <PageHeader
        title="Reviews"
        description="Customers submit reviews from product pages. Nothing appears until you approve it. “Verified buyer” means the reviewer's email matches a paid order for that piece."
      />
      {rows.length === 0 ? (
        <Empty>No reviews yet. They&rsquo;ll appear here as customers write them.</Empty>
      ) : (
        <ul className="grid gap-3">
          {rows.map(({ r, productName, productSlug }) => (
            <li key={r.id} className="border border-line bg-ivory p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-[13.5px]">
                  <StatusPill tone={r.status === "approved" ? "good" : r.status === "pending" ? "warn" : "bad"}>{r.status === "approved" ? "Approved" : r.status === "pending" ? "Waiting for review" : "Rejected"}</StatusPill>
                  {r.verifiedBuyer && <StatusPill tone="neutral">Verified buyer</StatusPill>}
                  {r.showOnHomepage && <StatusPill tone="neutral">On homepage</StatusPill>}
                  <span className="text-stone">
                    {r.name} · {r.email} · {formatDate(r.createdAt)} · {r.rating}/5
                  </span>
                </div>
                {productSlug && (
                  <Link href={`/product/${productSlug}`} target="_blank" className="text-[13px] underline underline-offset-4">
                    {productName}
                  </Link>
                )}
              </div>
              <p className="mt-3 max-w-[80ch]">{r.body}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-[13px]">
                {r.status !== "approved" && (
                  <ActionButton action={setReviewStatusAction.bind(null, r.id, "approved")} className="btn btn-solid !min-h-9 !px-3">
                    Approve
                  </ActionButton>
                )}
                {r.status !== "rejected" && (
                  <ActionButton action={setReviewStatusAction.bind(null, r.id, "rejected")} className="btn btn-outline !min-h-9 !px-3">
                    Reject
                  </ActionButton>
                )}
                {r.status === "approved" && (
                  <ActionButton action={toggleReviewHomepageAction.bind(null, r.id, !r.showOnHomepage)} className="btn btn-outline !min-h-9 !px-3">
                    {r.showOnHomepage ? "Remove from homepage" : "Show on homepage"}
                  </ActionButton>
                )}
                <ActionButton action={deleteReviewAction.bind(null, r.id)} confirm="Delete this review permanently?" className="text-oxblood underline">
                  Delete
                </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
