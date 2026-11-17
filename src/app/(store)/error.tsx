"use client";

import Link from "next/link";

export default function StoreError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="wrap py-28">
      <p className="label text-stone">Something went wrong</p>
      <h1 className="display mt-3 text-[40px]">This page didn&rsquo;t load.</h1>
      <p className="mt-4 max-w-[44ch] text-stone">Please try again. If it keeps happening, your bag is saved on this device and nothing has been charged.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={reset} className="btn btn-solid">
          Try again
        </button>
        <Link href="/" className="btn btn-outline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
