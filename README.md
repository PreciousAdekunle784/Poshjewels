# Posh Jewel

Online jewellery store for Posh Jewel: a storefront with catalogue, bag, wishlist, checkout and customer accounts, plus an admin dashboard for running the shop without touching code.

Built with Next.js 16 (App Router, Server Actions), SQLite/libSQL through Drizzle ORM, and Tailwind CSS 4.

## Quick start

```bash
npm install
cp .env.example .env        # then set SESSION_SECRET to a long random string
npm run db:setup            # apply migrations, add starter content and sample products
npm run admin:create -- you@example.com "a-strong-password" "Your Name"
npm run dev                 # http://localhost:3000  ·  admin at /admin
```

Schema changes: edit `src/db/schema.ts`, run `npm run db:generate`, commit the new file in `drizzle/`. It is applied automatically on the next deploy.

## What's in the store

| Area | What works |
| --- | --- |
| Homepage | Announcement bar, hero, shop-by-category mosaic, Just arrived, featured collection, The Posh favourites, brand story, reviews (only when approved reviews are featured), FAQ, newsletter. All copy and photos are editable in **Admin → Homepage**. |
| Catalogue | `/shop`, `/shop/<category>`, `/collections/<slug>`, `/search`. Category, price-range and in-stock filters, sorting, pagination. |
| Product pages | Image gallery (swipe on mobile), options such as finish or ring size with their own stock and price, quantity, stock status, delivery info, approved reviews, review form, related pieces, Product JSON-LD. |
| Bag & wishlist | Bag drawer and `/cart`; wishlist at `/wishlist`. Both are kept on the shopper's device. Prices and stock are re-checked against the database whenever the bag opens. |
| Checkout | Totals, delivery fees and stock are recalculated on the server. Stock is reserved atomically, so the last piece can't be sold twice. Pay by Paystack (when configured) or direct bank transfer. |
| Orders | Confirmation page with bank details or Paystack status. Signed-in customers see their orders under `/account`. |
| Admin `/admin` | Overview with a launch checklist, low stock and latest orders. Orders (filter, search, mark paid/shipped, cancel with automatic restock). Products (photo upload, reordering, options, stock, flags, collections), categories, collections, homepage content, announcement, contact details, delivery fees, bank details, pages and policies, FAQ, review moderation, contact messages, newsletter subscribers with CSV export. |

## Sample content: replace before launch

The seed creates **36 sample products** (`is_demo`). Their photos come from Unsplash (see `public/demo/CREDITS.md`). Their names, prices and stock levels are placeholders. Each sample product page says so.

- Edit a sample product and save: it becomes a real product.
- Or use **Admin → Products → Remove sample products** once your own pieces are in.
- Category photos, hero, featured and brand-story photos are also placeholders. Replace them in **Admin → Categories** and **Admin → Homepage**.

The **Before you launch** checklist on the admin overview tracks what's left: sample products, Paystack, bank details and contact details. The policy pages (shipping, returns, privacy, terms), the FAQ answers and the delivery fees (₦3,000 Lagos / ₦6,000 elsewhere) are drafts. Check them against how you actually run the business.

## Payments

**Bank transfer** works out of the box. Add your bank name, account name and 10-digit account number in **Admin → Store settings → Payments**. Bank-transfer orders reserve their stock until you mark them paid or cancel them.

**Paystack (card, bank, USSD)** is offered at checkout only when `PAYSTACK_SECRET_KEY` is set.

1. Add `PAYSTACK_SECRET_KEY` (use `sk_test_…` first) to the server environment and set `NEXT_PUBLIC_SITE_URL` to your live URL.
2. In the Paystack dashboard, set the webhook URL to `https://<your-domain>/api/paystack/webhook`.
3. Place a test order with a Paystack test card before switching to the live key.

An order is only marked paid after the server confirms the transaction with Paystack's verify API and checks that the amount and currency match. This happens both on the redirect back from Paystack and via the signed webhook, and it is idempotent. Unpaid card checkouts release their stock after 2 hours.

> Paystack has **not** been tested against the live API in this build, because no keys were available. The verification, amount check, idempotency, oversell guard and webhook signature logic are covered by `npm run test:payments` against a mocked Paystack API.

Order emails are **not** sent: no email provider is connected. Customers see everything on their confirmation page, and new orders appear in the dashboard. Connecting a provider such as Resend or Postmark is a small follow-up.

## Configuration

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | `file:./data/posh.db` locally. In production, a [Turso](https://turso.tech)/libSQL URL (`TURSO_DATABASE_URL` also works). |
| `DATABASE_AUTH_TOKEN` | Turso token for a remote database (`TURSO_AUTH_TOKEN` also works). |
| `BLOB_READ_WRITE_TOKEN` | Set by connecting a Vercel Blob store. Uploaded photos go there instead of `UPLOAD_DIR`. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Creates the first admin during deploy if none exists. |
| `SESSION_SECRET` | Signs login cookies. **Required** in production: 32+ random characters. |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO metadata, sitemap and the Paystack callback. On Vercel it defaults to the production domain. |
| `PAYSTACK_SECRET_KEY` | Enables card payments. |
| `UPLOAD_DIR` | Where uploaded photos are stored (default `./uploads`). |

## Deploying to Vercel

Vercel has no persistent disk, so the store uses a hosted database (Turso) and hosted photo storage (Vercel Blob). Both are added from the Vercel dashboard in a few clicks.

1. **Import the repository.** Vercel → Add New → Project → choose `Poshjewels`. Keep the detected Next.js settings; the build runs `npm run vercel-build`.
2. **Add the database.** Project → Storage → *Create Database* → **Turso** (from the Marketplace) → connect it to this project with **both Production and Preview** ticked (otherwise branch/preview builds can't see it). This sets `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`; a custom prefix is fine.
3. **Add photo storage.** Project → Storage → *Create* → **Blob** → connect it to this project. This sets the Blob credentials.
4. **Add environment variables** (Project → Settings → Environment Variables):
   - `SESSION_SECRET`: a random string of 32+ characters (for example, the output of `openssl rand -hex 32`).
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD`: your first admin login (10+ character password). Used once, when no admin exists.
   - Optional: `NEXT_PUBLIC_SITE_URL` (your custom domain) and `PAYSTACK_SECRET_KEY`.
5. **Deploy** (Deployments → Redeploy). Each build applies pending migrations; the first one also adds the starter content and sample products. Every later push to `main` deploys automatically.

If a build fails with *"No database configured"*, Turso isn't connected for that environment yet. The message lists the database-related variables the build can see (names only), which shows what is missing. Note that this store needs **Turso**; a Postgres store (Neon, Supabase) won't work.

**Other hosts.** Any Node host works. With a persistent disk, keep `data/` and `uploads/` on it and run `npm ci && npm run db:setup && npm run build && npm start`.

## Project layout

```
src/app/(store)      storefront pages
src/app/admin        dashboard (every page and action checks for an admin session)
src/app/actions      server actions for cart, checkout, auth and forms
src/app/api/paystack payment callback and webhook
src/components       UI components (home, catalog, product, cart, layout, admin)
src/db/schema.ts     database schema
src/lib              catalogue queries, orders, payments, settings, auth, uploads
scripts/             seed and admin-creation scripts
tests/               payment verification tests
```

## Design system

**Type.** Imbue, a condensed high-contrast didone from the fashion-masthead tradition, is the display face. It sets the wordmark, headlines, section titles, the Shop menu and product titles. Hanken Grotesk sets everything people read or use: navigation, product names, prices (tabular figures), body copy and buttons. Emphasis is *weight contrast within Imbue*, not italics or a second serif. Wrap a word in `*asterisks*` in the admin and it is set in the hairline weight ("The art of wearing *beauty*.").

**Wordmark.** "Posh" in heavy Imbue, "Jewel" in the hairline weight, mixed case, with no ornament. It uses the same weight contrast as the headlines.

**Navigation.**
- *Masthead.* The wordmark is anchored left at full size; a short primary list ("Shop", "New in", "Collections", "About") sits off-centre beside it, and the utilities are words rather than icons ("Search", "Account", "Wishlist", "Bag").
- *Scroll.* The header sticks with a negative offset, so scrolling itself folds the masthead away. One IntersectionObserver flags the compact state and the wordmark scales down from its baseline. There is no scroll listener.
- *Shop menu.* Opens an editorial panel: category names set large with item counts, and a photograph that follows the name you hover. Collections and help links sit underneath. It lifts open with a clip-path, then the lines rise in sequence. Escape, the Close link or Shop again closes it.
- *Mobile.* A sheet lifts open under the header, so the wordmark, Close and Bag never move. It has search, category rows with photographs, collection chips and secondary links.

**Calls to action.** One family, with different jobs:
- *Primary* (`<Cta>`): a ticket-shaped block, label left and a drawn hairline arrow right. On hover a layer wipes across and the arrow lengthens.
- *Editorial link* (`<CtaLink>`): a short hairline under the words grows to full width while an arrow slides in.
- *Add to bag* (product page): label and running total separated by a hairline, like a price tag.
- *Product cards:* an add strip unveils from the base of the photograph on hover; touch screens get a small plus.
- *Forms:* full-width; a champagne hairline runs along the base while the request is pending.
- *Navigation:* sentence case; a small "facet" (a rotated square, the brand's only ornament) marks hover and the current page.

**Motion.** One verb, *unveil*: a clip-path lift, like opening a jewellery-box lid. Two easings: silk for arrivals, swift for departures.
- *Hero:* the photograph unveils and settles, then the headline rises word by word through a mask. This is CSS only and plays once.
- *Scroll:* section titles, key photographs and product rows reveal once. One shared IntersectionObserver unobserves each element after it reveals.
- *Product cards:* the second photograph wipes up on hover.
- *Page transitions:* pages crossfade through React `<ViewTransition>`, and the clicked product photograph morphs into the product page's main image. The header stays anchored.
- *Performance:* everything animates transform, opacity or clip-path. Reduced motion shows everything instantly, and without JavaScript nothing is hidden. No animation libraries were added.

**Colour.** Ivory `#F5EFE6`, bone `#EAE1D3`, espresso `#1F1813`, cocoa `#3A2B23`, and champagne `#A68A5B` used only for small accents. The swing tags on the category photographs remain.
