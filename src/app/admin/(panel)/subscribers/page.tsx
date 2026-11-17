import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { deleteSubscriberAction } from "@/app/admin/actions";
import { ActionButton } from "@/components/admin/forms";
import { Empty, PageHeader, td, th } from "@/components/admin/ui";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Newsletter" };

export default async function SubscribersAdmin() {
  const subs = await db.select().from(schema.subscribers).orderBy(desc(schema.subscribers.createdAt));
  return (
    <>
      <PageHeader
        title="Newsletter subscribers"
        description={`${subs.length} ${subs.length === 1 ? "person has" : "people have"} subscribed. Download the list to import into your email tool.`}
        actions={
          subs.length > 0 && (
            <a href="/admin/subscribers.csv" className="btn btn-solid">
              Download CSV
            </a>
          )
        }
      />
      {subs.length === 0 ? (
        <Empty>No subscribers yet.</Empty>
      ) : (
        <div className="overflow-x-auto border border-line bg-ivory">
          <table className="w-full min-w-[520px]">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Email</th>
                <th className={th}>Signed up from</th>
                <th className={th}>Date</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {subs.map((s) => (
                <tr key={s.id}>
                  <td className={td}>{s.email}</td>
                  <td className={`${td} text-stone`}>{s.source}</td>
                  <td className={`${td} text-stone`}>{formatDate(s.createdAt)}</td>
                  <td className={`${td} text-right`}>
                    <ActionButton action={deleteSubscriberAction.bind(null, s.id)} confirm={`Remove ${s.email}?`} className="text-[13px] text-oxblood underline">
                      Remove
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
