---
name: build-preview
description: Research a construction contractor and generate a full lead-generating website preview (Hero, Who We Help, Problems & Solutions, 4-Step Process, Why Us, Contact/GHL Hub, FAQ) plus a Permission-First outreach DM. Use when building a prospect preview.
argument-hint: "<Company Name>" "<Sub-Niche>" "<City>" "<AU|US>" [Optional URL]
disable-model-invocation: true
---

# Dynamic Lead-Gen Website Preview Builder

When invoked with `<Company Name> <Sub-Niche> <City> <AU|US> [Optional URL]`:

## Step 0: Inspect the photo library FIRST (mandatory, before writing any JSON)
- Run `ls -R public/assets/` and read `lib/stock.ts` (`STOCK` and `NICHES`).
- ONLY assign photos that exist on disk right now. In the JSON, photos are referenced by **key** (e.g. `"deck"`), never by file path. Every key maps to exact files in `lib/stock.ts`. Never invent a key or a filename.
- Need a photo the library doesn't have? Add it to the library first (see "Adding a stand-in photo"), then use its key.

## Step 1: Research & Fact Verification (Playwright MCP)
- If a Website, Facebook, or LinkedIn URL is provided, inspect it first.
- If no URL is provided or a social page hits a login wall, search public listings (Google Business Profile / directories) for `<Company Name> <City>`.
- Extract ONLY verified public facts: exact business name, phone number, suburbs/service areas, real services offered, primary/accent brand hex colors (if site exists; otherwise default to `#13243A`, `#2478CC`, `#F59E0B`), Google rating/review count, and up to 3 verbatim public Google reviews.
- Identify **1 specific lead-capture gap** (e.g., no website, no quote form above the fold, Facebook-only, slow/manual reply).
- NEVER invent reviews, stats, years in business, or licenses. If a detail is not publicly verified, omit it cleanly.
- NEVER download or host a prospect's copyrighted photos or logo files. Map `assetFolder` to our local `/public/assets/<niche>/` sample photos.

## Step 2: Sub-Niche & Market Localization
- **AU (`AU`):** Use "quotes", "tradies/builders", casual and direct tone.
- **US (`US`):** Use "estimates" or "quotes", direct blue-collar tone.
- **Sub-Niche Adaptation:**
  - *HVAC / Plumbing:* Emphasize speed, reliability, upfront pricing. 4th form field = `Urgency` (Emergency Today / This Week / Quote Only).
  - *Remodeling / Carpentry / Builders:* Emphasize craftsmanship, clear scope, on-time finish. 4th form field = `Project Type` (e.g., Kitchen / Bathroom / Deck / Addition).
  - *Roofing:* Emphasize leak protection, fast inspections, durable materials. 4th form field = `Roof Need` (Leak Repair / Restoration / Replacement / Inspection).
  - *Electrical / Solar:* Emphasize safety, compliance, tidy work. 4th form field = `Service Type`.

## Step 3: Write Complete Homepage Copy into `data/previews/<slug>.json`
Write homeowner-facing, zero-hype conversion copy matching our `PreviewData` schema:
1. **Hero:** Eyebrow, Headline, Subhead, Primary/Secondary CTA, 3-item Trust Line, 4th form field options, Skye AI greeting.
2. **Who We Help (`#about`):** Headline, Body, 3 tailored project/customer cards, Closing line.
3. **Problems & Solutions (`#services`):** Problem Headline, 4 homeowner pain points, Bridge line, Solution Headline, 3 numbered service cards mapped to their real services.
4. **Process & Why Us (`#process`):** Process Headline, 4 clear steps, Why Us Headline, 4 proof themes, plus verified `realReviews` array (empty if none found).
5. **Final CTA (`#contact`):** Final Headline, CTA Body, Primary CTA, no-pressure Microcopy.
6. **FAQ (`#faq`):** 5 practical homeowner Q&As tailored to their trade and city.

## Step 3b: Design the concept logo (logo-design skill, fast track)
Use the installed `logo-design` skill (`~/.claude/skills/logo-design`, run its scripts with `py -3` on Windows). For previews we run its **fast track** and skip the full kit:
1. Brief in one line from the research (trade, 3 adjectives, what to avoid). List the category clichés (house, roof, hammer, wrench, faucet, water drop) and avoid them unless given a fresh form.
2. Build **3 black SVG concepts** (viewBox 0 0 256 256, no `<text>`, letterforms as paths), across mark types (monogram / pictorial / abstract), in `.taste-skill/logos/<slug>/`.
3. `py -3 <skill>/scripts/svg_audit.py …` then `concept_sheet.py … --greyscale -o .taste-skill/logos/<slug>-concepts.png` and LOOK at it. Run the craft checks: letter test (does the M read as an M at 16 px?), unintended readings (a "shirt", an "arrow"), clip-art literalism. Revise until one passes; snap near-miss angles the audit flags.
4. Final site file: white one-colour mark centred (scale ~0.6) on a rounded tile (`rx="56"`) in the CLIENT's `brand.primary` (default `#2478cc`), saved as `public/assets/logos/<slug>.svg`. Keep it one colour: a second colour on part of the mark can create false readings.
5. In the JSON: `"logo": { "initials", "tagline", "svg": "/assets/logos/<slug>.svg" }`. The page shows it in nav, footer and as the tab icon; if the file is missing it falls back to the initials badge, and `check:preview` errors.
6. Never copy or trace the prospect's real logo or any library logo. The footer already says "Logo shown is a concept mark."

## Step 4: Verify, Commit & Output Outreach Assets
1. Run `npm run check:preview -- <slug>` and fix every `error` (and read every `warn`).
2. Run `npm run build` to confirm zero TypeScript or layout errors.
3. Stage and commit `data/previews/<slug>.json` (`git add data/previews/<slug>.json && git commit -m "Add preview: <slug>"`) and push if a git remote is configured. If you added photos, also `git add public/assets lib/stock.ts`.
4. Print to the terminal:
   - **Live URL:** `https://preview.skyearc.tech/<slug>`
   - **Identified Gap:** The exact lead-capture leak found.
   - **Permission-First DM (3 lines, no raw link in Message #1, no hype, never promising "more leads" or revenue):** Ready to copy-paste into LinkedIn or Facebook Messenger.

---

# Reference (read before Step 3, so nothing needs troubleshooting again)

## Photo library: exact keys and files (as of 2026-11-24; re-check with `ls -R public/assets/`)

| Key | Files on disk | Shows | Licence |
|---|---|---|---|
| `kitchen` | `public/assets/remodeling/photo-f32731566{-500,-960,,-hero}.webp` | Renovated kitchen, white cabinets, tools on the counter | CC0 |
| `bathroom` | `public/assets/remodeling/photo-f91731451{-500,-960,}.webp` | Tiled walk-in shower, twin shower heads | CC BY 2.0 |
| `roofing` | `public/assets/roofing/photo-f137161354{-500,-960}.webp` | Aerial view, new standing-seam metal roof | CC0 |
| `plumbing` | `public/assets/plumbing/photo-f31908153{-500,-960,,-hero}.webp` | Fitting an isolation valve under a sink | CC0 |
| `electrical` | `public/assets/electrical/photo-f76424255{-500,-960,}.webp` | Switchboard with breakers and wiring | CC0 |
| `framing` | `public/assets/carpentry/photo-f94379265{-500,-960,,-hero}.webp` | Two-storey timber house frame (**default photo**) | CC BY-SA 4.0 |
| `deck` | `public/assets/carpentry/photo-deck{-500,-960,}.webp` | Timber verandah deck, new boards | CC0 |
| `pergola` | `public/assets/carpentry/photo-pergola{-500,-960,}.webp` | White timber pergola rafters on a column | CC BY-SA 4.0 |
| `tile` | `public/assets/remodeling/photo-tile{-500,-960,}.webp` | Hand bedding floor tile, spacers in the joints | CC BY 2.0 |

`{-500,-960,}` means three files: `…-500.webp`, `…-960.webp` and `….webp` (1280w). Only keys with a `-hero` file are sharp enough for the full-width hero: **`kitchen`, `plumbing`, `framing`**. Use one of those for `hero.photo`.

`assetFolder` sets (used when a service has no `photo`, in order):

| assetFolder | Photos |
|---|---|
| `remodeling` | kitchen, bathroom, tile |
| `carpentry` | framing, deck, pergola |
| `roofing` | roofing, framing, deck |
| `plumbing` | plumbing, bathroom, kitchen |
| `electrical` | electrical, kitchen, framing |
| `builders` | framing, kitchen, deck |

Pick the 3 service photos to match the 3 real services (a decking service gets `deck`, not `kitchen`). Never use the same photo on two cards unless the library has nothing closer.

### Adding a stand-in photo (only when the library has nothing that fits)
1. Search Wikimedia Commons by API (free licences only: CC0, CC BY, CC BY-SA, public domain):
   `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch=<terms>&gsrlimit=12&prop=imageinfo&iiprop=size|extmetadata`
2. Download through `https://commons.wikimedia.org/w/thumb.php?f=<File_name.jpg>&w=1280` with a real User-Agent (`SkyeArcPreviewBuilder/1.0 (https://skyearc.tech)`). `Special:FilePath` and direct `upload.wikimedia.org` links return HTTP 429 "Too many requests". Wait 2-3 s between downloads.
3. LOOK at the photo before using it (it must show the trade, no people's faces, no branding).
4. Convert with sharp to `public/assets/<niche>/photo-<name>-500.webp`, `-960.webp` and `.webp` (1280w), quality ~74. For a hero, also `-hero.webp` at 2200w (`withoutEnlargement`).
5. Add an entry to `STOCK` in `lib/stock.ts` (`base: "<niche>/photo-<name>"`, `w`, `h`, `large`, optional `hero`, `alt`, `by`, `licence`, `licenceUrl`, `page`), and to `NICHES` if it suits a niche.
6. Run `npm run check:preview` (it fails if any key points at a missing file).

## JSON format (`data/previews/<slug>.json`)
Copy `data/previews/_TEMPLATE.json`; it documents every field. Slug = company name in kebab-case (`perth-carpentry-and-roofing`). Exact counts, enforced by `npm run check:preview`:

| Field | Required content |
|---|---|
| `_sources` | Object: where each fact came from (URL + date). Never rendered. |
| `gap` | The one lead-capture gap. Never rendered. |
| `market` | `"AU"` or `"US"` |
| `company` | `name`, `trade` (noun phrase), `city` ("Perth, WA" / "Plano, TX"); optional `serviceArea[]`, `phone` (as published), `credential` (ONLY if published) |
| `logo` | Concept logo (auto-rendered in nav, footer and tab icon): `initials` (1-3 letters, e.g. `PC`) and `tagline` (e.g. `Carpentry & Roofing · Perth`). Never their real logo file. |
| `brand` | Client colours `{ primary, dark, accent, primaryInk }`, see the Design rule; omit if unknown |
| `assetFolder` | One of the `NICHES` keys above |
| `google` | `{ rating, reviewCount, profileUrl }` with the REAL Google Maps listing link, or `null` |
| `hero` | `eyebrow` (used only when `google` is null), `headline` (names trade + city; the city word is auto-highlighted), `subhead` (2 sentences), optional `primaryCta`/`secondaryCta`, `trustLine` (exactly 3), `photo` (hero-capable key) |
| `quoteField` | `{ label, options[] }`: the 4th quick-form field per Step 2 |
| `skyeGreeting` | First chat message, market tone |
| `about` | `headline`, `body`, `cards` (exactly 3 `{title, body}`), `closing` |
| `problems` | `headline`, `points` (exactly 4), `bridge` |
| `solutions` | `headline`, optional `intro`, `services` (exactly 3 `{title, body, photo}`) |
| `process` | `headline`, `steps` (exactly 4) |
| `why` | `headline`, `themes` (exactly 4) |
| `realReviews` | Verbatim Google reviews `{author, rating, text, date}`; `[]` if none verified |
| `finalCta` | `headline`, `body`, optional `cta`, `microcopy` |
| `faq` | Exactly 5 `{q, a}` |
| `embeds` | `ghlFormUrl`, `ghlCalendarUrl` (empty string = working mockup with a "Preview mockup" tag), optional `skyeWebhookUrl`, `quickQuoteWebhookUrl` |

## Design rule: skyearc.tech STYLE, client COLOURS (permanent)
Every preview copies the *style* of skyearc.tech and the *colours* of the client. Never use SkyeArc's own colours (navy #07213f, ocean #044696, sky #23bdf5, coral) on a client preview.

**Style (already built into `app/[slug]/page.tsx` + the "PREMIUM LAYER" in `app/globals.css`; do not restyle per prospect):**
- Type: Montserrat 700/800 headings, Open Sans body, uppercase letter-spaced kickers.
- Header clear over the hero, frosted white once scrolled; full-bleed photo hero with a dark brand gradient, the city word in the H1 drawn with an animated arc underline, a curved white wave into the next section.
- **Apple TV-style cards**: any element with `data-tilt` leans toward the cursor in 3D with a moving glare (`components/preview/TiltCards.tsx`). Used on Who-We-Help cards, the problem bento tiles, service photos and review cards. Mouse only; off on touch and reduced motion. Put `data-tilt` on an element INSIDE a `<Reveal>`, never on the Reveal itself (framer-motion overwrites its transform).
- Problems as a bento grid (big photo tile + 4 dark tiles), services as alternating dark rows (text + photo), glass pill buttons with a round arrow chip, process as big numerals, Why-us as a sticky left column + bordered list, two-column FAQ, four-column footer.

**Colours (from the client only):** fill `brand` in the JSON:
| Field | Used for | Default if unknown |
|---|---|---|
| `brand.primary` | buttons, links, logo badge, blueprint lines | `#2478CC` |
| `brand.dark` | hero shade, dark sections, footer | `#13243A` |
| `brand.accent` | arc underline, icons, numerals on dark | `#F59E0B` |
| `brand.primaryInk` | text on primary buttons | `#ffffff` (use `#0b1626` when primary is light: yellow, lime, sky) |

How to find them: the client's website CSS (`theme-color`, button and header colours), their logo, van wraps or signage in their Google Business Profile photos (look, don't download). Record the source in `_sources.brand`. Check contrast: white text on `primary` must read clearly (4.5:1); if not, set `primaryInk`. `dark` must be dark enough for white text. If nothing is verifiable, omit `brand` and the defaults apply.

## Permanent fixes already in the code (do NOT re-troubleshoot these)
- **Broken/blank images:** `resolvePhoto()` (`lib/stock-server.ts`) checks every photo's files exist at build time and falls back to `DEFAULT_PHOTO` (`framing`). Service cards render through `components/preview/SafeImg.tsx` with `loading="eager"` and an `onError` swap to the default photo (it also catches errors that fired before hydration). A wrong key can never produce a grey box, but fix it anyway: the checker reports it.
- **Photo paths:** the library lives in `public/assets/<niche>/`. There is no `public/stock/` any more; the checker errors on `/stock/`.
- **Nav links:** anchors live in `lib/nav.ts`. Never export plain data from a `"use client"` file and import it into the server page (the build fails with `NAV_LINKS.map is not a function`).
- **One page only:** no `/about`, `/services`, `/contact` routes. Nav = `#home`, `#about` (Who We Help), `#services`, `#contact`; Privacy Policy and Terms show an "included in full launch build" toast.
- **Sticky header:** the concept banner and nav are in normal flow (sticky), so they never overlap the hero. Long company names wrap to 2 lines on phones; the header CTA hides on phones (it's in the drawer and bottom bar).
- **Wording safety:** CTA defaults to "Get a quote"/"Get an estimate". Only write "Free quote" if the contractor publicly offers it. Never write "no hidden fees", guarantees, "more leads" or revenue promises (the checker errors on these). The licence FAQ offers to send details unless `company.credential` is published.
- **GHL embeds:** empty URLs show working mockups, not placeholders. The quick hero form posts to `/api/quote`; without a webhook (501) it pre-fills the hub form and scrolls to `#hub`.
- **Logo:** every preview gets a designed concept mark from Step 3b (`logo.svg`); without one it falls back to an original typographic badge (`components/preview/Logo.tsx`: initials under a roof line in the brand colour, plus name and tagline), also used as the browser tab icon. The footer notes it is a concept mark. Just fill `logo.initials` / `logo.tagline`; defaults work if omitted.
- **Robots:** `noindex, nofollow` is hard-coded in `app/layout.tsx`, `X-Robots-Tag` is set in `next.config.ts`, and `public/robots.txt` disallows all. Don't touch.

## Research tactics that work
- **Google Business Profile:** WebFetch on a Maps URL returns an empty JS shell. Render it in headless Chrome instead (e.g. design-taste-frontend's `shoot.mjs --url "<maps url>?hl=en" --w 1440 --h 900 --wait 8000`) and read the screenshot: name, rating, category, phone, hours and the drawn service area are visible. The signed-out view hides the review count and review text, so ask the user to paste verbatim reviews; never paraphrase.
- **Directories that list AU tradies:** tradieladder.com.au (rating + Google review count, dated), carpentersau.one, avenueperth.com, Houzz, Oneflare. whereis.com returns 403. Cross-check the phone across at least 2 sources and record each in `_sources`.
- A company domain listed on a directory may not resolve (that is often the lead-capture gap).

## Verify before reporting
1. `npm run check:preview -- <slug>` → `✓`.
2. `npm run build` → the slug appears under `/[slug]` as `○` (static).
3. Look at the page at 1440 and 390: hero, the 3 service photos, the hub. The design-taste-frontend `shoot.mjs` full-page capture can drop content right above each 900/1800/2700 px stitch seam; if a heading looks cut there, crop that section at 390 or scroll to it before calling it a bug.
