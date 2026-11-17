import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPage } from "@/lib/pages";
import { paragraphs } from "@/lib/format";

export const metadata: Metadata = { title: "About", alternates: { canonical: "/about" } };

export default async function AboutPage() {
  const page = await getPage("about");
  const body = paragraphs(page?.body);
  return (
    <div className="pb-24">
      <section className="wrap grid gap-10 pt-10 lg:grid-cols-12 lg:items-end lg:pt-14">
        <h1 className="display text-[44px] lg:col-span-6 lg:text-[64px]">{page?.title ?? "About Posh Jewel"}</h1>
        {body[0] && <p className="max-w-[44ch] text-[17px] leading-relaxed lg:col-span-5 lg:col-start-8">{body[0]}</p>}
      </section>
      <section className="wrap mt-12 grid gap-3 sm:grid-cols-[1.4fr_1fr] lg:mt-16">
        <div className="relative aspect-[4/5] overflow-hidden bg-bone sm:aspect-auto sm:min-h-[560px]">
          <Image src="/demo/editorial-pendants.jpg" alt="Pendant necklaces hanging at different lengths" fill sizes="(min-width:640px) 58vw, 100vw" className="object-cover" />
        </div>
        <div className="relative hidden aspect-[3/4] overflow-hidden bg-bone sm:block">
          <Image src="/demo/hero-layered-portrait.jpg" alt="Fine layered necklaces worn with an open white shirt" fill sizes="40vw" className="object-cover" />
        </div>
      </section>
      {body.length > 1 && (
        <section className="wrap mt-14 grid lg:grid-cols-12">
          <div className="prose-posh max-w-[60ch] text-[16px] leading-relaxed text-stone lg:col-span-6 lg:col-start-6">
            {body.slice(1).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="pt-4">
              <Link href="/shop" className="btn btn-solid">
                Shop the collection
              </Link>
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
