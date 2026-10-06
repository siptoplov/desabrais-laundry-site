# Desabrais Laundry & Dry Cleaning — website

One-page, mobile-first website for **Desabrais Laundry & Dry Cleaning**, 1232 Exchange St, Middlebury, VT 05753.
Plain HTML + CSS + a little vanilla JS. No build step, no frameworks, no tracking. Deploys as a static site.

**Preview:** https://siptoplov.github.io/desabrais-laundry-site/
(The preview shows a "Concept preview" banner and is hidden from Google on purpose — see *Go-live checklist*.)

---

## 1. What's in the folder

```
index.html            ← ALL the text, prices, hours, FAQ live here (search for "CONFIRM" and "✏️ EDIT")
assets/css/styles.css ← colors & fonts are variables at the top (:root)
assets/js/main.js     ← menu, photo viewer, scroll effects (no editing needed)
assets/img/           ← gallery photos (currently labeled placeholders), logo icons, social-share image
sitemap.xml, robots.txt, site.webmanifest, favicon.svg/.ico, 404.html
_headers              ← security + caching headers (used by Netlify / Cloudflare Pages)
```

### How to edit (no coding)
1. Open `index.html` in any text editor (VS Code, Notepad++, even Notepad).
2. Search for `CONFIRM`. Each one looks like `<mark class="confirm">[CONFIRM: price per wash]</mark>`.
   Replace the **whole** `<mark>…</mark>` with the real value, e.g. `$4.50`.
3. Save, then upload / push the file again. The page updates in about a minute.

Tip: open the page on your computer (or add `?draft` to the web address) and a small yellow pill in the corner shows how many `[CONFIRM]` items are left. Visitors never see the pill.

---

## 2. Checklist — everything still marked [CONFIRM]

Fill these in with the owner (a 10-minute phone call covers most of it):

**Hours**
- [ ] Is the laundromat open 24 hours, **all 7 days, including holidays**? (hero, Visit, FAQ, structured data)
- [ ] **Attendant hours** (we only know "on site during the week")
- [ ] **Dry-cleaning counter** drop-off & pick-up days/hours

**Prices & machines**
- [ ] Washer sizes + price per wash (3 rows in the Pricing card)
- [ ] Dryer price per ___ minutes (extra-large + any other size)
- [ ] Number of washers / dryers, largest washer capacity, whether king-size comforters fit
- [ ] Dry-cleaning price list (shirt, pants, suit, dress/coat are examples — edit the list), turnaround time
- [ ] Payment: tap-to-pay on washers is confirmed. Dryers? Coins? Cash? Other cards?
- [ ] `priceRange` for Google ("$" or "$$") — see the comment above the JSON-LD block in `index.html`

**Services** (cards are hidden until confirmed — see the commented-out cards in the *Services* section)
- [ ] Wash & Fold / Drop-off service?
- [ ] Pickup & Delivery?

**Contact & extras**
- [ ] Email address (Visit section + optional structured data)
- [ ] Wi-Fi? Vending / snacks? (Visit → "Good to know")
- [ ] Social links (footer + `sameAs` in structured data)
- [ ] Owner name, year established, short story (optional "Our story" block is commented out in *Why Us*)
- [ ] Drive time from Middlebury College (FAQ)

**Photos** — replace the 6 labeled placeholders in `assets/img/` (see §4).

**Google review text** — the 3 highlights are *paraphrased themes*, not quotes. To show a real review, copy it word-for-word and ask the reviewer's permission.

---

## 3. Go-live checklist

When the owner approves the site:

1. Fill in the `[CONFIRM]` items above.
2. **Delete the preview banner:** in `index.html` remove the block between `<!-- PREVIEW ONLY … -->` and `<!-- /PREVIEW ONLY -->`.
3. **Allow Google to index it:** delete the line `<meta name="robots" content="noindex, nofollow">` near the top of `index.html`.
4. **Swap the web address:** Find & Replace `siptoplov.github.io/desabrais-laundry-site` with the real domain (e.g. `www.desabraislaundry.com`) in `index.html`, `sitemap.xml` and `robots.txt`.
5. Update `<lastmod>` in `sitemap.xml`.
6. Check the page on a phone, then submit the sitemap in Google Search Console.

---

## 4. Photos

The gallery uses labeled placeholder illustrations ("REPLACE: real photo of …"). To replace one:

1. Take the photo (landscape, 4:3 is best). Convert to **WebP** (free: squoosh.app), about **1200×900 px**, ideally under 200 KB.
2. Put it in `assets/img/`, e.g. `interior-1.webp`.
3. In the Gallery section of `index.html`, change both `data-full="…"` and `src="…"` to the new file name.
4. Rewrite the `alt="…"` text to describe what is *really* in the photo (it's read aloud by screen readers and helps Google).
5. Replace `assets/img/og-image.png` (1200×630) if you want a photo in link previews.

---

## 5. Publishing

### GitHub Pages (what the preview uses)
Repo → **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**. Every `git push` updates the site.

### Netlify (drag-and-drop, easiest for the owner)
1. Go to app.netlify.com → **Add new site → Deploy manually**.
2. Drag the whole folder in. Done — you get a `*.netlify.app` address.
3. (Optional, auto-updates) **Add new site → Import from Git**, pick this repo; build command empty, publish directory `.`.

### Cloudflare Pages
**Workers & Pages → Create → Pages → Connect to Git**, pick the repo, framework "None", build command empty, output directory `/`.

### Vercel
**Add New → Project**, import the repo, framework "Other", leave build settings empty.

### Connect a custom domain
1. Buy/choose the domain (Namecheap, Cloudflare Registrar, Porkbun…).
2. In the host's dashboard open **Domains → Add custom domain** and type it (e.g. `www.desabraislaundry.com`).
3. At the registrar's DNS settings add what the host shows — usually a **CNAME** record for `www` → the host's address (GitHub Pages: `siptoplov.github.io`), and the host's A/ALIAS records for the bare domain.
4. Wait for the HTTPS certificate (minutes to a few hours), then do step 4 of the *Go-live checklist*.
   For GitHub Pages also add the domain under **Settings → Pages → Custom domain** (this creates a `CNAME` file).

---

## 6. Three ways to improve local visibility

1. **Add the website to the Google Business Profile.** Profile → *Edit profile → Contact → Website* → paste the live address. Make sure name, address and phone match the site **exactly** (Desabrais Laundry & Dry Cleaning · 1232 Exchange St, Middlebury, VT 05753 · +1 (802) 388-9079). Then also confirm hours (24h, attendant hours, dry-cleaning counter hours as separate "more hours").
2. **Upload real photos.** Interior, rows of washers, the extra-large dryers, entrance/accessible entrance, parking and the storefront — 10+ photos, new ones every month. Use the same photos on the website. Profiles with many photos get noticeably more calls and direction requests.
3. **Ask for and answer reviews.** Put a "Review us on Google" card/QR code by the door (Profile → *Ask for reviews* gives the short link), and reply to every review — thank people, answer complaints politely. Replies show Google (and customers) the business is active. Optionally add the Google "Services" and "Attributes" (wheelchair-accessible entrance, free parking, contactless payment, 24 hours).

Bonus: get listed consistently (same name/address/phone) on Yelp, Bing Places, Apple Business Connect and Facebook.

---

## 7. Technical notes

- **Local SEO:** `DryCleaningOrLaundry` JSON-LD (name, address, phone, geo, 24-hour opening hours, rating, amenities), Open Graph + Twitter cards, canonical URL, sitemap, robots, one H1, logical H2/H3.
- **`aggregateRating` (4.2 / 102)** mirrors the Google listing. Update it when the Google numbers change, or delete that block in the JSON-LD. (Google doesn't show star rich-results for a business's own ratings, so it is optional.)
- **Accessibility:** skip link, landmarks, visible focus, keyboard-friendly photo viewer and FAQ, WCAG AA contrast, `prefers-reduced-motion` respected.
- **Performance** (Lighthouse, local test with compression on): Performance / Accessibility / Best Practices / SEO = 100 / 100 / 100 / 100. Body text uses the visitor's system font; only the heading font (Quicksand) is fetched from Google Fonts, after the page has loaded.
- **Privacy:** no analytics, no cookies, no cookie banner. Slots for Plausible / GA4 are commented in the `<head>`. The only third-party requests are Google Fonts and the Google Map.
- **Facts used on the site** come only from the business brief and the Google Maps listing (address, phone, 24 hours, 4.2★ / 102 reviews, accessibility, tap-to-pay, free parking, large dryers, attendants on weekdays). Everything else is a visible `[CONFIRM]`.
