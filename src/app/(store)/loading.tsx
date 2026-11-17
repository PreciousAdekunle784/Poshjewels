export default function Loading() {
  return (
    <div className="wrap py-16" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-56 animate-pulse bg-bone" />
      <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] animate-pulse bg-bone" />
            <div className="mt-3 h-3 w-3/4 animate-pulse bg-bone" />
          </div>
        ))}
      </div>
    </div>
  );
}
