import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { editorOptions } from "@/lib/admin-data";
import { ProductEditor } from "../product-editor";

export const metadata = { title: "Add product" };

export default async function NewProduct() {
  const { categories, collections } = await editorOptions();
  return (
    <>
      <PageHeader
        title="Add product"
        actions={
          <Link href="/admin/products" className="btn btn-outline">
            Back to products
          </Link>
        }
      />
      <ProductEditor initial={null} categories={categories} collections={collections} />
    </>
  );
}
