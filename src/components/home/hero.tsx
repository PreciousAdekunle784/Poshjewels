import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/settings";
import { Emph } from "@/components/emph";

export function Hero({ hero }: { hero: SiteSettings["hero"] }) {
  return (
    <section aria-label="Introduction" className="lg:grid lg:h-[min(calc(100svh-156px),860px)] lg:min-h-[600px] lg:grid-cols-[minmax(0,1.38fr)_minmax(0,1fr)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-bone sm:aspect-[16/13] lg:aspect-auto lg:h-full">
        <Image src={hero.image} alt={hero.imageAlt} fill priority sizes="(min-width:1024px) 58vw, 100vw" className="object-cover object-[50%_30%]" />
      </div>

      <div className="relative flex flex-col px-4 pb-14 pt-9 sm:px-8 lg:px-12 lg:pb-14 lg:pt-12 xl:px-16">
        {hero.secondaryImage && (
          <div className="relative ml-auto hidden aspect-[4/5] w-[44%] max-w-[260px] overflow-hidden bg-bone lg:block">
            <Image src={hero.secondaryImage} alt={hero.secondaryImageAlt} fill sizes="260px" className="object-cover" />
          </div>
        )}
        <div className="lg:mt-auto">
          <h1 className="display max-w-[11ch] text-[44px] sm:text-[56px] xl:text-[68px]">
            <Emph text={hero.headline} />
          </h1>
          <p className="mt-5 max-w-[40ch] text-[15.5px] leading-relaxed text-stone">{hero.copy}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-7">
            <Link href={hero.primaryHref} className="btn btn-solid">
              {hero.primaryLabel}
            </Link>
            {hero.secondaryLabel && (
              <Link href={hero.secondaryHref} className="label link self-start py-2 sm:self-auto">
                {hero.secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
