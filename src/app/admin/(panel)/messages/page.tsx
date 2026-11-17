import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { setMessageHandledAction } from "@/app/admin/actions";
import { ActionButton } from "@/components/admin/forms";
import { Empty, PageHeader, StatusPill } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Messages" };

export default async function MessagesAdmin() {
  const messages = await db.select().from(schema.contactMessages).orderBy(desc(schema.contactMessages.createdAt)).limit(300);
  return (
    <>
      <PageHeader title="Messages" description="Sent from the Contact page. Reply by email, then mark them done." />
      {messages.length === 0 ? (
        <Empty>No messages yet.</Empty>
      ) : (
        <ul className="grid gap-3">
          {messages.map((m) => (
            <li key={m.id} className={`border border-line p-5 ${m.handled ? "bg-paper text-stone" : "bg-ivory"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 text-[13.5px]">
                <span>
                  <span className="font-medium text-espresso">{m.name}</span> ·{" "}
                  <a href={`mailto:${m.email}`} className="underline underline-offset-4">
                    {m.email}
                  </a>
                  {m.phone && <> · {m.phone}</>} · {formatDateTime(m.createdAt)}
                </span>
                {m.handled ? <StatusPill tone="neutral">Done</StatusPill> : <StatusPill tone="warn">New</StatusPill>}
              </div>
              <p className="mt-3 whitespace-pre-line">{m.message}</p>
              <ActionButton action={setMessageHandledAction.bind(null, m.id, !m.handled)} className="mt-4 text-[13px] underline">
                {m.handled ? "Mark as new" : "Mark as done"}
              </ActionButton>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
