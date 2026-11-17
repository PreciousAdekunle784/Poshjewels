import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_ROOT } from "@/lib/uploads";

const TYPES: Record<string, string> = { ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".avif": "image/avif" };

/** Serves uploaded images from UPLOAD_DIR (files added after build aren't served from /public). */
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const parts = (await ctx.params).path;
  const target = path.resolve(/*turbopackIgnore: true*/ UPLOAD_ROOT, ...parts);
  if (!target.startsWith(UPLOAD_ROOT + path.sep)) return new Response("Not found", { status: 404 });
  const type = TYPES[path.extname(target).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });
  try {
    const data = await fs.readFile(target);
    return new Response(new Uint8Array(data), { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
