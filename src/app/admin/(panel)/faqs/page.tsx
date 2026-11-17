import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { deleteFaqAction, saveFaqAction } from "@/app/admin/actions";
import { ActionButton, ActionForm, Check, Field, TextArea } from "@/components/admin/forms";
import { PageHeader, Panel } from "@/components/admin/ui";

export const metadata = { title: "FAQ" };

export default async function FaqAdmin() {
  const faqs = await db.select().from(schema.faqs).orderBy(asc(schema.faqs.sortOrder), asc(schema.faqs.id));
  return (
    <>
      <PageHeader title="FAQ" description="The first six published questions appear on the homepage. All of them appear on the FAQ page." />
      <div className="grid gap-4">
        {faqs.map((f) => (
          <Panel key={f.id}>
            <ActionForm action={saveFaqAction}>
              <input type="hidden" name="id" value={f.id} />
              <div className="grid gap-4 md:grid-cols-[1fr_110px]">
                <Field name="question" label="Question" defaultValue={f.question} />
                <Field name="sortOrder" label="Position" type="number" min={0} defaultValue={f.sortOrder} />
              </div>
              <TextArea name="answer" label="Answer" defaultValue={f.answer} rows={3} />
              <Check name="isPublished" label="Published" defaultChecked={f.isPublished} />
            </ActionForm>
            <ActionButton action={deleteFaqAction.bind(null, f.id)} confirm="Delete this question?" className="mt-3 text-[13px] text-oxblood underline">
              Delete
            </ActionButton>
          </Panel>
        ))}
        <Panel title="Add a question">
          <ActionForm action={saveFaqAction} submitLabel="Add question" resetOnSuccess>
            <div className="grid gap-4 md:grid-cols-[1fr_110px]">
              <Field name="question" label="Question" />
              <Field name="sortOrder" label="Position" type="number" min={0} defaultValue={faqs.length} />
            </div>
            <TextArea name="answer" label="Answer" rows={3} />
            <Check name="isPublished" label="Published" defaultChecked />
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}
