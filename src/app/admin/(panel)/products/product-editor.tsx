"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProductAction, saveProductAction, uploadImagesAction, type ProductPayload } from "@/app/admin/actions";
import { slugify } from "@/lib/format";
import { CloseIcon } from "@/components/icons";

type Option = { id: number; name: string };
type VariantRow = { id?: number; name: string; sku: string; priceOverride: string; stock: string };

export function ProductEditor({
  initial,
  categories,
  collections,
}: {
  initial: (Omit<ProductPayload, "variants"> & { variants: ProductPayload["variants"]; isDemo?: boolean }) | null;
  categories: Option[];
  collections: Option[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [uploading, startUpload] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [details, setDetails] = useState(initial?.details ?? "");
  const [categoryId, setCategoryId] = useState<string>(initial?.categoryId ? String(initial.categoryId) : "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [compareAt, setCompareAt] = useState(initial?.compareAtPrice ? String(initial.compareAtPrice) : "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [flags, setFlags] = useState({
    isPublished: initial?.isPublished ?? true,
    isNewArrival: initial?.isNewArrival ?? true,
    isBestSeller: initial?.isBestSeller ?? false,
    isFeatured: initial?.isFeatured ?? false,
  });
  const [collectionIds, setCollectionIds] = useState<number[]>(initial?.collectionIds ?? []);
  const [images, setImages] = useState(initial?.images ?? []);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants.map((v) => ({ id: v.id, name: v.name, sku: v.sku ?? "", priceOverride: v.priceOverride != null ? String(v.priceOverride) : "", stock: String(v.stock) })) ?? [
      { name: "Default", sku: "", priceOverride: "", stock: "0" },
    ],
  );

  const num = (s: string) => (s.trim() === "" ? null : Number(s.replace(/[,\s₦]/g, "")));

  function upload(files: FileList | null) {
    if (!files?.length) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    fd.append("folder", "products");
    startUpload(async () => {
      const res = await uploadImagesAction(fd);
      setImages((prev) => [...prev, ...res.urls.map((url) => ({ url, alt: name }))]);
      setUploadErrors(res.errors);
    });
  }

  function move(i: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function save() {
    const p = num(price);
    if (p === null || Number.isNaN(p)) {
      setMessage({ ok: false, text: "Add a price in naira." });
      return;
    }
    const payload: ProductPayload = {
      id: initial?.id,
      name,
      slug: slug || slugify(name),
      description,
      details,
      categoryId: categoryId ? Number(categoryId) : null,
      price: p,
      compareAtPrice: num(compareAt),
      label: label.trim() || null,
      ...flags,
      collectionIds,
      images,
      variants: variants.map((v) => ({ id: v.id, name: v.name, sku: v.sku.trim() || null, priceOverride: num(v.priceOverride), stock: Number(v.stock || 0) })),
    };
    start(async () => {
      const res = await saveProductAction(payload);
      setMessage({ ok: res.ok, text: res.message });
      if (res.ok && res.id) router.replace(`/admin/products/${res.id}?${initial?.id ? "saved" : "created"}=${Date.now()}`, { scroll: false });
    });
  }

  const section = "border border-line bg-ivory p-5";
  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <div className="grid content-start gap-6">
        {initial?.isDemo && (
          <p className="border border-champagne bg-[#f6efe2] px-4 py-3 text-[14px]">
            This is a sample listing. Replace the photo, name, price and stock with a real piece, then save. It will stop being marked as a sample.
          </p>
        )}
        <section className={section}>
          <div className="grid gap-4">
            <label className="block">
              <span className="field-label">Name</span>
              <input
                className="field"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
              />
            </label>
            <label className="block">
              <span className="field-label">Web address</span>
              <div className="flex items-center">
                <span className="border border-r-0 border-line bg-bone px-3 py-3 text-[13px] text-stone">/product/</span>
                <input
                  className="field"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                />
              </div>
            </label>
            <label className="block">
              <span className="field-label">Description</span>
              <textarea className="field" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
              <span className="mt-1 block text-[12.5px] text-stone">Shown under the price. Leave a blank line between paragraphs.</span>
            </label>
            <label className="block">
              <span className="field-label">Details (optional)</span>
              <textarea className="field" rows={4} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Materials, measurements, closure type…" />
            </label>
          </div>
        </section>

        <section className={section}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="label">Photos</h2>
            <label className="btn btn-outline !min-h-9 cursor-pointer !px-3">
              {uploading ? "Uploading…" : "Upload photos"}
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => (upload(e.target.files), (e.target.value = ""))} />
            </label>
          </div>
          <p className="mb-4 text-[12.5px] text-stone">The first photo is the main image; the second appears when shoppers hover. Portrait photos (4:5) look best. JPG, PNG or WebP up to 10 MB.</p>
          {uploadErrors.map((e) => (
            <p key={e} className="mb-2 text-[13px] text-oxblood">
              {e}
            </p>
          ))}
          {images.length === 0 ? (
            <p className="border border-dashed border-line py-10 text-center text-stone">No photos yet.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((img, i) => (
                <li key={img.url} className="border border-line bg-paper">
                  <div className="relative aspect-[4/5] bg-bone">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                    {i === 0 && <span className="label absolute left-0 top-2 bg-ivory px-2 py-1 text-[9.5px]">Main</span>}
                    <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute right-1.5 top-1.5 bg-ivory p-1" aria-label="Remove photo">
                      <CloseIcon size={14} />
                    </button>
                  </div>
                  <div className="grid gap-1.5 p-2">
                    <input
                      value={img.alt}
                      onChange={(e) => setImages(images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
                      placeholder="Describe the photo"
                      aria-label="Photo description"
                      className="border border-line bg-ivory px-2 py-1 text-[12.5px]"
                    />
                    <div className="flex justify-between text-[12px]">
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="underline disabled:opacity-30">
                        Move left
                      </button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="underline disabled:opacity-30">
                        Move right
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={section}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="label">Options & stock</h2>
            <button type="button" onClick={() => setVariants([...variants, { name: "", sku: "", priceOverride: "", stock: "0" }])} className="btn btn-outline !min-h-9 !px-3">
              Add option
            </button>
          </div>
          <p className="mb-4 text-[12.5px] text-stone">Options are what the customer chooses, like “Gold tone” or “Size 7”. For a piece with no choices, keep one option called “Default”.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-[14px]">
              <thead>
                <tr className="text-left text-[12px] text-stone">
                  <th className="pb-2 font-normal">Option name</th>
                  <th className="pb-2 font-normal">SKU</th>
                  <th className="pb-2 font-normal">Different price (₦)</th>
                  <th className="pb-2 font-normal">In stock</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => {
                  const set = (k: keyof VariantRow, val: string) => setVariants(variants.map((x, j) => (j === i ? { ...x, [k]: val } : x)));
                  return (
                    <tr key={i}>
                      <td className="pb-2 pr-2">
                        <input className="field !min-h-10 !py-1.5" value={v.name} onChange={(e) => set("name", e.target.value)} aria-label="Option name" />
                      </td>
                      <td className="pb-2 pr-2">
                        <input className="field !min-h-10 !py-1.5" value={v.sku} onChange={(e) => set("sku", e.target.value)} aria-label="SKU" />
                      </td>
                      <td className="pb-2 pr-2">
                        <input className="field !min-h-10 !py-1.5" inputMode="numeric" placeholder="Same" value={v.priceOverride} onChange={(e) => set("priceOverride", e.target.value.replace(/[^\d]/g, ""))} aria-label="Price for this option" />
                      </td>
                      <td className="pb-2 pr-2">
                        <input className="field !min-h-10 w-24 !py-1.5" inputMode="numeric" value={v.stock} onChange={(e) => set("stock", e.target.value.replace(/[^\d]/g, ""))} aria-label="Stock" />
                      </td>
                      <td className="pb-2">
                        <button type="button" disabled={variants.length === 1} onClick={() => setVariants(variants.filter((_, j) => j !== i))} className="p-2 disabled:opacity-30" aria-label="Remove option">
                          <CloseIcon size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="grid content-start gap-6">
        <section className={`${section} xl:sticky xl:top-20`}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="field-label">Price (₦)</span>
                <input className="field" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))} />
              </label>
              <label className="block">
                <span className="field-label">Was (₦)</span>
                <input className="field" inputMode="numeric" value={compareAt} onChange={(e) => setCompareAt(e.target.value.replace(/[^\d]/g, ""))} placeholder="Optional" />
              </label>
            </div>
            <p className="-mt-2 text-[12.5px] text-stone">Fill “Was” only for a genuine reduction. The piece will show as on sale.</p>
            <label className="block">
              <span className="field-label">Category</span>
              <select className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="field-label">Label (optional)</span>
              <input className="field" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Limited, Set, Statement" maxLength={30} />
            </label>
            <fieldset className="grid gap-2.5 border-t border-line pt-4">
              <legend className="label mb-2 text-[10.5px] text-stone">Where it appears</legend>
              {(
                [
                  ["isPublished", "Visible in the store"],
                  ["isNewArrival", "Just arrived"],
                  ["isBestSeller", "The Posh favourites"],
                  ["isFeatured", "Featured"],
                ] as const
              ).map(([k, l]) => (
                <label key={k} className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" className="h-4 w-4 accent-espresso" checked={flags[k]} onChange={(e) => setFlags({ ...flags, [k]: e.target.checked })} />
                  {l}
                </label>
              ))}
            </fieldset>
            {collections.length > 0 && (
              <fieldset className="grid gap-2.5 border-t border-line pt-4">
                <legend className="label mb-2 text-[10.5px] text-stone">Collections</legend>
                {collections.map((c) => (
                  <label key={c.id} className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-espresso"
                      checked={collectionIds.includes(c.id)}
                      onChange={(e) => setCollectionIds(e.target.checked ? [...collectionIds, c.id] : collectionIds.filter((x) => x !== c.id))}
                    />
                    {c.name}
                  </label>
                ))}
              </fieldset>
            )}
            <div className="grid gap-2 border-t border-line pt-4">
              <button type="button" onClick={save} disabled={pending || uploading} className="btn btn-solid w-full">
                {pending ? "Saving…" : initial ? "Save changes" : "Create product"}
              </button>
              {message && (
                <p className={`text-[13.5px] ${message.ok ? "text-moss" : "text-oxblood"}`} role="status">
                  {message.text}
                </p>
              )}
              {initial?.id && (
                <>
                  <a href={`/product/${slug}`} target="_blank" className="text-center text-[13px] underline underline-offset-4">
                    View in store
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete “${name}”? This can't be undone. Past orders keep their details.`)) start(() => deleteProductAction(initial.id!));
                    }}
                    className="mt-2 text-[13px] text-oxblood underline underline-offset-4"
                  >
                    Delete product
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
