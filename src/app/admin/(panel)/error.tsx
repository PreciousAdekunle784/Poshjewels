"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="border border-oxblood/40 bg-ivory p-6">
      <h1 className="text-[18px]">This screen couldn&rsquo;t load.</h1>
      <p className="mt-2 text-stone">{error.digest ? `Error reference: ${error.digest}` : "Please try again."}</p>
      <button onClick={reset} className="btn btn-solid mt-5">
        Try again
      </button>
    </div>
  );
}
