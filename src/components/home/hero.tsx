import Image from "next/image";
import type { CSSProperties } from "react";
import type { SiteSettings } from "@/lib/settings";
import { Words, plain } from "@/components/motion/words";
import { CtaLink, FrameCta } from "@/components/ui/cta";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * Opening sequence (CSS only, plays once): the campaign photograph unveils upward and settles,
 * the inset photograph follows, the headline rises word by word through a mask, then copy and actions.
 */
export function Hero({ hero }: { hero: SiteSettings["hero"] }) {
  return (
    <section aria-label="Introduction" className="lg:grid lg:min-h-[max(620px,min(calc(100svh-100px),880px))] lg:grid-cols-[minmax(0,1.38fr)_minmax(0,1fr)]">
      <div className="hero-unveil relative aspect-[4/5] overflow-hidden bg-bone sm:aspect-[16/13] lg:aspect-auto lg:h-full" style={d(0)}>
        <span className="hero-drift absolute inset-0 block">
          <Image src={hero.image} alt={hero.imageAlt} fill priority sizes="(min-width:1024px) 58vw, 100vw" className="object-cover object-[50%_30%]" />
        </span>
      </div>

      <div className="relative flex flex-col px-4 pb-14 pt-9 sm:px-8 lg:px-12 lg:pb-14 lg:pt-12 xl:px-16">
        {hero.secondaryImage && (
          <div className="hero-unveil relative ml-auto hidden aspect-[4/5] w-[40%] max-w-[230px] shrink-0 overflow-hidden bg-bone lg:block" style={d(260)}>
            <Image src={hero.secondaryImage} alt={hero.secondaryImageAlt} fill sizes="230px" className="object-cover" />
          </div>
        )}
        <div className="lg:mt-auto lg:pt-8">
          <h1 className="display t-hero hero-words max-w-[9ch] lg:max-w-[12ch]" aria-label={plain(hero.headline)}>
            <Words text={hero.headline} />
          </h1>
          <p className="hero-follow mt-6 max-w-[40ch] text-[16px] leading-relaxed text-stone" style={d(900)}>
            {hero.copy}
          </p>
          <div className="hero-follow mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8" style={d(1040)}>
            <FrameCta href={hero.primaryHref}>{hero.primaryLabel}</FrameCta>
            {hero.secondaryLabel && <CtaLink href={hero.secondaryHref}>{hero.secondaryLabel}</CtaLink>}
          </div>
        </div>
      </div>
    </section>
  );
}
