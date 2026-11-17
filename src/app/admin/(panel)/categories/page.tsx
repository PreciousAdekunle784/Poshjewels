import { asc, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { deleteCategoryAction, saveCategoryAction } from "@/app/admin/actions";
import { ActionButton, ActionForm, Field, ImageField, TextArea } from "@/components/admin/forms";
import { PageHeader, Panel } from "@/components/admin/ui";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const [categories, counts] = await Promise.all([
    db.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder)),
    db.select({ id: schema.products.categoryId, n: sql<number>`count(*)` }).from(schema.products).groupBy(schema.products.categoryId),
  ]);
  return (
    <>
      <PageHeader title="Categories" description="Categories power the shop menu, the category pages and the Shop by category mosaic on the homepage (the first category is the large tile)." />
      <div className="grid gap-4">
        {categories.map((c) => (
          <Panel key={c.id} title={`${c.name} · ${counts.find((x) => x.id === c.id)?.n ?? 0} products`}>
            <ActionForm action={saveCategoryAction}>
              <input type="hidden" name="id" value={c.id} />
              <div className="grid gap-4 md:grid-cols-[1fr_1fr_120px]">
                <Field name="name" label="Name" defaultValue={c.name} required />
                <Field name="slug" label="Web address (/shop/…)" defaultValue={c.slug} />
                <Field name="sortOrder" label="Position" type="number" min={0} defaultValue={c.sortOrder} />
              </div>
              <TextArea name="description" label="Introduction" defaultValue={c.description ?? ""} rows={2} />
              <ImageField name="imageUrl" label="Category photo" defaultValue={c.imageUrl} />
            </ActionForm>
            <ActionButton action={deleteCategoryAction.bind(null, c.id)} confirm={`Delete the ${c.name} category? Its products stay in the store without a category.`} className="mt-4 text-[13px] text-oxblood underline">
              Delete category
            </ActionButton>
          </Panel>
        ))}
        <Panel title="Add a category">
          <ActionForm action={saveCategoryAction} submitLabel="Add category" resetOnSuccess>
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_120px]">
              <Field name="name" label="Name" required />
              <Field name="slug" label="Web address (optional)" />
              <Field name="sortOrder" label="Position" type="number" min={0} defaultValue={categories.length} />
            </div>
            <TextArea name="description" label="Introduction" rows={2} />
            <ImageField name="imageUrl" label="Category photo" />
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}
