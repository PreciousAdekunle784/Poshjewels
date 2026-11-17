import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/pages";
import { formatDate, paragraphs } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage((await params).slug);
  return page ? { title: page.title, alternates: { canonical: `/pages/${page.slug}` } } : {};
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "about") notFound();
  const page = await getPage(slug);
  if (!page) notFound();
  return (
    <article className="wrap grid gap-8 pb-24 pt-10 lg:grid-cols-12 lg:pt-14">
      <header className="lg:col-span-4">
        <h1 className="display t-title">{page.title}</h1>
        <p className="mt-3 text-[13px] text-stone">Last updated {formatDate(page.updatedAt)}</p>
      </header>
      <div className="prose-posh max-w-[64ch] text-[15.5px] leading-relaxed lg:col-span-7 lg:col-start-6">
        {paragraphs(page.body).map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </article>
  );
}
