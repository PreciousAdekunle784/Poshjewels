import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { saveSettingsAction } from "@/app/admin/actions";
import { ActionForm, Check, Field, ImageField, TextArea } from "@/components/admin/forms";
import { PageHeader, Panel } from "@/components/admin/ui";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Homepage" };

const emphHint = "Wrap a word in *asterisks* to set it in italic.";

export default async function HomepageAdmin() {
  const s = await getSettings(["hero", "featured", "editorial", "sections", "newsletter", "brand"]);
  const collections = await db.select().from(schema.collections).orderBy(asc(schema.collections.sortOrder));
  return (
    <>
      <PageHeader title="Homepage" description="Edit the words and photography on the homepage. Product sections fill themselves from the flags on each product." />
      <div className="grid gap-6">
        <Panel title="Hero">
          <ActionForm action={saveSettingsAction}>
            <input type="hidden" name="_key" value="hero" />
            <Field name="headline" label="Headline" defaultValue={s.hero.headline} hint={emphHint} required />
            <TextArea name="copy" label="Supporting copy" defaultValue={s.hero.copy} rows={3} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field name="primaryLabel" label="Main button text" defaultValue={s.hero.primaryLabel} />
              <Field name="primaryHref" label="Main button link" defaultValue={s.hero.primaryHref} />
              <Field name="secondaryLabel" label="Second link text" defaultValue={s.hero.secondaryLabel} />
              <Field name="secondaryHref" label="Second link" defaultValue={s.hero.secondaryHref} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <ImageField name="image" label="Main photo (large, left)" defaultValue={s.hero.image} />
                <Field name="imageAlt" label="Main photo description" defaultValue={s.hero.imageAlt} />
              </div>
              <div className="grid gap-2">
                <ImageField name="secondaryImage" label="Small photo (desktop only)" defaultValue={s.hero.secondaryImage} />
                <Field name="secondaryImageAlt" label="Small photo description" defaultValue={s.hero.secondaryImageAlt} />
              </div>
            </div>
          </ActionForm>
        </Panel>

        <Panel title="Product sections">
          <ActionForm action={saveSettingsAction}>
            <input type="hidden" name="_key" value="sections" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field name="newArrivalsHeading" label="New arrivals heading" defaultValue={s.sections.newArrivalsHeading} />
              <Field name="newArrivalsCopy" label="New arrivals line" defaultValue={s.sections.newArrivalsCopy} />
              <Field name="bestSellersHeading" label="Best sellers heading" defaultValue={s.sections.bestSellersHeading} />
              <Field name="bestSellersCopy" label="Best sellers line" defaultValue={s.sections.bestSellersCopy} />
              <Field name="reviewsHeading" label="Reviews heading (shown only when reviews are featured)" defaultValue={s.sections.reviewsHeading} />
              <Field name="faqHeading" label="FAQ heading" defaultValue={s.sections.faqHeading} />
            </div>
          </ActionForm>
        </Panel>

        <Panel title="Featured collection">
          <ActionForm action={saveSettingsAction}>
            <input type="hidden" name="_key" value="featured" />
            <Check name="enabled" label="Show this section" defaultChecked={s.featured.enabled} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field name="eyebrow" label="Small label" defaultValue={s.featured.eyebrow} />
              <Field name="headline" label="Headline" defaultValue={s.featured.headline} hint={emphHint} />
            </div>
            <TextArea name="copy" label="Copy" defaultValue={s.featured.copy} rows={3} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field name="ctaLabel" label="Button text" defaultValue={s.featured.ctaLabel} />
              <label className="block">
                <span className="field-label">Collection</span>
                <select name="collectionSlug" defaultValue={s.featured.collectionSlug} className="field">
                  <option value="">Products marked “Featured”</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <ImageField name="image" label="Photo" defaultValue={s.featured.image} />
            <Field name="imageAlt" label="Photo description" defaultValue={s.featured.imageAlt} />
          </ActionForm>
        </Panel>

        <Panel title="Brand story">
          <ActionForm action={saveSettingsAction}>
            <input type="hidden" name="_key" value="editorial" />
            <Check name="enabled" label="Show this section" defaultChecked={s.editorial.enabled} />
            <Field name="headline" label="Headline" defaultValue={s.editorial.headline} hint={emphHint} />
            <TextArea name="body" label="Story" defaultValue={s.editorial.body} rows={6} hint="Leave a blank line between paragraphs." />
            <div className="grid gap-4 md:grid-cols-2">
              <Field name="ctaLabel" label="Button text (leave empty to hide)" defaultValue={s.editorial.ctaLabel} />
              <Field name="ctaHref" label="Button link" defaultValue={s.editorial.ctaHref} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <ImageField name="imageA" label="Large photo" defaultValue={s.editorial.imageA} />
                <Field name="imageAAlt" label="Large photo description" defaultValue={s.editorial.imageAAlt} />
              </div>
              <div className="grid gap-2">
                <ImageField name="imageB" label="Small photo (desktop only)" defaultValue={s.editorial.imageB} />
                <Field name="imageBAlt" label="Small photo description" defaultValue={s.editorial.imageBAlt} />
              </div>
            </div>
          </ActionForm>
        </Panel>

        <Panel title="Newsletter & footer">
          <ActionForm action={saveSettingsAction}>
            <input type="hidden" name="_key" value="newsletter" />
            <Field name="headline" label="Newsletter headline" defaultValue={s.newsletter.headline} hint={emphHint} />
            <Field name="copy" label="Newsletter line" defaultValue={s.newsletter.copy} />
          </ActionForm>
          <div className="mt-6 border-t border-line pt-6">
            <ActionForm action={saveSettingsAction}>
              <input type="hidden" name="_key" value="brand" />
              <TextArea name="footerDescription" label="Footer description" defaultValue={s.brand.footerDescription} rows={3} />
            </ActionForm>
          </div>
        </Panel>
      </div>
    </>
  );
}
