import { asc, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { deleteCollectionAction, saveCollectionAction } from "@/app/admin/actions";
import { ActionButton, ActionForm, Check, Field, ImageField, TextArea } from "@/components/admin/forms";
import { PageHeader, Panel } from "@/components/admin/ui";

export const metadata = { title: "Collections" };

export default async function CollectionsAdmin() {
  const [collections, counts] = await Promise.all([
    db.select().from(schema.collections).orderBy(asc(schema.collections.sortOrder)),
    db.select({ id: schema.productCollections.collectionId, n: sql<number>`count(*)` }).from(schema.productCollections).groupBy(schema.productCollections.collectionId),
  ]);
  return (
    <>
      <PageHeader title="Collections" description="Curated edits. Add products to a collection from each product's page. The New Arrivals collection is linked from the hero." />
      <div className="grid gap-4">
        {collections.map((c) => (
          <Panel key={c.id} title={`${c.name} · ${counts.find((x) => x.id === c.id)?.n ?? 0} products`}>
            <ActionForm action={saveCollectionAction}>
              <input type="hidden" name="id" value={c.id} />
              <div className="grid gap-4 md:grid-cols-[1fr_1fr_120px]">
                <Field name="name" label="Name" defaultValue={c.name} required />
                <Field name="slug" label="Web address (/collections/…)" defaultValue={c.slug} />
                <Field name="sortOrder" label="Position" type="number" min={0} defaultValue={c.sortOrder} />
              </div>
              <TextArea name="description" label="Introduction" defaultValue={c.description ?? ""} rows={2} />
              <ImageField name="imageUrl" label="Cover photo (optional)" defaultValue={c.imageUrl} />
              <Check name="isPublished" label="Visible in the store" defaultChecked={c.isPublished} />
            </ActionForm>
            <ActionButton action={deleteCollectionAction.bind(null, c.id)} confirm={`Delete the ${c.name} collection? Products are not deleted.`} className="mt-4 text-[13px] text-oxblood underline">
              Delete collection
            </ActionButton>
          </Panel>
        ))}
        <Panel title="Add a collection">
          <ActionForm action={saveCollectionAction} submitLabel="Add collection" resetOnSuccess>
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_120px]">
              <Field name="name" label="Name" required />
              <Field name="slug" label="Web address (optional)" />
              <Field name="sortOrder" label="Position" type="number" min={0} defaultValue={collections.length} />
            </div>
            <TextArea name="description" label="Introduction" rows={2} />
            <ImageField name="imageUrl" label="Cover photo (optional)" />
            <Check name="isPublished" label="Visible in the store" defaultChecked />
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}
