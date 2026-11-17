import Link from "next/link";
import { getSetting } from "@/lib/settings";

export async function AnnouncementBar() {
  const a = await getSetting("announcement");
  if (!a.enabled || !a.text.trim()) return null;
  const inner = <span className="text-[12px] tracking-[0.06em]">{a.text}</span>;
  return (
    <div className="bg-cocoa text-ivory">
      <div className="wrap flex min-h-9 items-center justify-center py-1.5 text-center">
        {a.link ? (
          <Link href={a.link} className="underline-offset-4 hover:underline">
            {inner}
          </Link>
        ) : (
          inner
        )}
      </div>
    </div>
  );
}
