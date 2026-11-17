import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap py-28">
      <p className="label text-stone">Page not found</p>
      <h1 className="display mt-3 text-[40px] lg:text-[56px]">This piece has moved on.</h1>
      <p className="mt-4 max-w-[44ch] text-stone">The page you&rsquo;re looking for doesn&rsquo;t exist or is no longer available.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/shop" className="btn btn-solid">
          Shop all jewellery
        </Link>
        <Link href="/" className="btn btn-outline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
