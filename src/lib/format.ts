const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Prices are stored as whole naira. */
export function formatNaira(amount: number) {
  return naira.format(amount).replace("NGN", "₦").replace(/\s/g, "");
}

export function formatDate(d: Date | number | null | undefined) {
  if (!d) return "";
  const date = typeof d === "number" ? new Date(d * 1000) : d;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(d: Date | null | undefined) {
  if (!d) return "";
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Split admin-entered plain text into paragraphs. */
export function paragraphs(text: string | null | undefined) {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
