"use client";

import Image from "next/image";
import { useRef, useState, ViewTransition } from "react";

export function Gallery({ images, name, productId }: { images: { url: string; alt: string }[]; name: string; productId: number }) {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return <div className="aspect-[4/5] bg-bone" aria-label={`${name}: image coming soon`} />;
  }

  function go(i: number) {
    setActive(i);
    const rail = railRef.current;
    if (rail) rail.scrollTo({ left: rail.clientWidth * i, behavior: "smooth" });
  }

  return (
    <div className="lg:flex lg:gap-4">
      {images.length > 1 && (
        <div className="order-first hidden w-[76px] shrink-0 flex-col gap-3 lg:flex">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => go(i)}
              className={`relative aspect-[4/5] overflow-hidden bg-bone transition-opacity ${i === active ? "outline outline-1 outline-offset-2 outline-espresso" : "opacity-70 hover:opacity-100"}`}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-current={i === active}
            >
              <Image src={img.url} alt="" fill sizes="76px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative min-w-0 flex-1">
        <div
          ref={railRef}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto sm:mx-0"
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== active) setActive(i);
          }}
        >
          {images.map((img, i) => (
            <div key={img.url + i} className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-bone">
              {i === 0 ? (
                // Shares its name with the product card that was clicked, so the photograph morphs into place.
                <ViewTransition name={`product-${productId}`} share="morph" default="none">
                  <Image src={img.url} alt={img.alt || name} fill priority sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
                </ViewTransition>
              ) : (
                <Image src={img.url} alt={img.alt || name} fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
              )}
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex justify-center gap-2 lg:hidden">
            {images.map((_, i) => (
              <button key={i} type="button" onClick={() => go(i)} className="p-1.5" aria-label={`Show image ${i + 1}`}>
                <span className={`block h-1.5 w-1.5 rounded-full ${i === active ? "bg-espresso" : "bg-line"}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
