import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { savePageAction } from "@/app/admin/actions";
import { ActionForm, Field, TextArea } from "@/components/admin/forms";
import { PageHeader, Panel } from "@/components/admin/ui";

export const metadata = { title: "Pages & policies" };

export default async function PagesAdmin() {
  const pages = await db.select().from(schema.pages).orderBy(asc(schema.pages.slug));
  return (
    <>
      <PageHeader
        title="Pages & policies"
        description="These pages started as drafts. Read each one and change anything that doesn't match how you run the business, especially returns and delivery."
      />
      <div className="grid gap-6">
        {pages.map((p) => (
          <Panel key={p.slug} title={p.slug === "about" ? "About page" : `/pages/${p.slug}`} actions={<a href={p.slug === "about" ? "/about" : `/pages/${p.slug}`} target="_blank" className="text-[13px] underline underline-offset-4">View</a>}>
            <ActionForm action={savePageAction}>
              <input type="hidden" name="slug" value={p.slug} />
              <Field name="title" label="Title" defaultValue={p.title} />
              <TextArea name="body" label="Text" defaultValue={p.body} rows={10} hint="Leave a blank line between paragraphs." />
            </ActionForm>
          </Panel>
        ))}
      </div>
    </>
  );
}
