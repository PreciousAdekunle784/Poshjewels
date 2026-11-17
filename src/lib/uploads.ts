import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Runtime-only location (outside the build), so it is excluded from output file tracing.
export const UPLOAD_ROOT = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? "./uploads");
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"]);

/** Resizes to at most 2000px, converts to WebP and stores under UPLOAD_DIR/<folder>. Returns the public URL. */
export async function saveImage(file: File, folder: "products" | "content" = "products") {
  if (!(file instanceof File) || file.size === 0) throw new Error("No file received.");
  if (file.size > MAX_BYTES) throw new Error(`${file.name} is larger than 10 MB.`);
  if (file.type && !ACCEPTED.has(file.type)) throw new Error(`${file.name} isn't a supported image (use JPG, PNG or WebP).`);
  const input = Buffer.from(await file.arrayBuffer());
  let output: Buffer;
  try {
    output = await sharp(input).rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  } catch {
    throw new Error(`${file.name} couldn't be read as an image.`);
  }
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}.webp`;
  const dir = path.join(/*turbopackIgnore: true*/ UPLOAD_ROOT, folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(/*turbopackIgnore: true*/ dir, name), output);
  return `/media/${folder}/${name}`;
}

export async function deleteImage(url: string) {
  if (!url.startsWith("/media/")) return; // demo images in /public are left alone
  const target = path.resolve(/*turbopackIgnore: true*/ UPLOAD_ROOT, url.slice("/media/".length));
  if (!target.startsWith(UPLOAD_ROOT + path.sep)) return;
  await fs.unlink(target).catch(() => {});
}
