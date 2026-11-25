---
name: build-preview
description: Research a construction contractor and generate a full lead-generating website preview (Hero, Who We Help, Problems & Solutions, 4-Step Process, Why Us, Contact/GHL Hub, FAQ) plus outreach mockup images (desktop + phone) and a Permission-First outreach DM. Use when building a prospect preview.
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
- Extract ONLY verified public facts: exact business name, phone number, suburbs/service areas, real services offered, Google rating/review count, and up to 3 verbatim public Google reviews.
- **Reviews step (mandatory, never skip, never assume none):** get the rating, count, topic chips, exact listing URL and up to 3 COMPLETE 5★ reviews with **Claude in Chrome** (see "Research tactics → Get rating, count and reviews"). If Chrome isn't connected, ask the user to paste them. An automated render showing no reviews means Google's limited view, not "no reviews".
- Identify **1 specific lead-capture gap** (e.g., no website, no quote form above the fold, Facebook-only, slow/manual reply).
- NEVER invent reviews, stats, years in business, or licenses. If a detail is not publicly verified, omit it cleanly.
- NEVER download or host a prospect's copyrighted photos or logo files. Map `assetFolder` to our local `/public/assets/<niche>/` sample photos.

## Step 1b: Client colour palette (MANDATORY for every prospect)
The page style is always skyearc.tech; the **colours are always the client's**. Work down this list and stop at the first that exists:
1. **Their own brand**: website CSS (`theme-color`, header/button colours), logo, Facebook/Instagram profile image, van wrap or signage. Use those hexes.
2. **No brand online** (the usual case for small trades): take the colours of **their own work** from their Google Business Profile cover photo:
   ```bash
   node <design-taste-frontend>/scripts/shoot.mjs --url "https://www.google.com/maps/search/<Name>+<City>?hl=en" --w 1440 --h 900 --out .taste-skill/shots/<slug>-maps.png --profile .taste-skill/chrome-maps --no-tiles --wait 8000
   node scripts/sample-brand.mjs .taste-skill/shots/<slug>-maps.png
   ```
   LOOK at the screenshot first (it must be their listing, not a search list), then at the suggestion. The script prints dominant colours, a suggested `{ primary, dark, accent }` and the contrast checks. Adjust by eye if it misses the obvious colour of the photo (e.g. Moxey: marble `#d1d1c8` read better as accent than the suggested darker grey). Only colours are measured: never save or reuse their photo.
   **Grey/low-colour photo (marble, concrete, white rooms)?** Never ship a black-and-white page: the headline highlight and CTA buttons need real colour. `sample-brand.mjs` detects it and takes the hidden hue of the photo's most colourful 8% of pixels (Moxey's marble: 43° = brass), suggesting a saturated `primary` + `accent` and `primaryInk: "#1d1c18"` when white text fails on a light primary. Result for Moxey: matte black `#282823` + brass `#d0a539` / `#e2bd5e`, brass logo.
3. **No usable photo either**: omit `brand`; defaults apply (`#2478CC` / `#13243A` / `#F59E0B`).

Rules: white on `primary` ≥ 4.5:1, white on `dark` ≥ 4.5:1, `accent` on `dark` ≥ 4.5:1 (`sample-brand.mjs` exits 2 if not). If `primary` is light, add `primaryInk: "#0b1626"`. Record the source in `_sources.brand`; for option 2 say "sampled from their listing photo, not an official brand; confirm with the owner". Worked examples: Moxey (marble bathroom, low-colour → brass) = `#d0a539 / #282823 / #e2bd5e`, ink `#1d1c18`; Perth (blue trusses on terracotta) = `#305b83 / #241b20 / #caa183`.

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
1. **Hero:** Eyebrow, Headline, Subhead, Primary/Secondary CTA, 3-item Trust Line, 4th form field options, chat greeting as the client ("I'm the <Company> assistant", never Skye).
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
4. Final site file, in the CLIENT's palette from Step 1b: the mark in ONE colour on a rounded tile. Pick the pair that echoes their work and contrasts strongly, e.g. `primary`/`accent` on `dark` (Moxey: brass M on matte black) or a light tint of `primary` on `dark` (Perth: timber blue `#6fa3cf` on charcoal):
   ```bash
   node scripts/make-logo-tile.mjs .taste-skill/logos/<slug>/final-mark.svg <slug> --bg "<dark>" --fg "<accent or light primary>" [--scale 0.6] [--dy 6]
   ```
   It writes `public/assets/logos/<slug>.svg` (refuses live `<text>` and a non-256 viewBox). Render it with `render_png.py` and LOOK at it at 256 and 32 px before using it. Keep the mark one colour: two colours on parts of a mark create false readings (Perth's amber king post read as a "down arrow").
5. In the JSON: `"logo": { "initials", "tagline", "svg": "/assets/logos/<slug>.svg" }`. The page shows it in nav, footer and as the tab icon; if the file is missing it falls back to the initials badge, and `check:preview` errors.
6. Never copy or trace the prospect's real logo or any library logo. The footer already says "Logo shown is a concept mark."

## Step 4: Verify, Commit & Output Outreach Assets
1. Run `npm run check:preview -- <slug>` and fix every `error` (and read every `warn`).
2. Run `npm run build` to confirm zero TypeScript or layout errors.
3. Stage and commit `data/previews/<slug>.json` (`git add data/previews/<slug>.json && git commit -m "Add preview: <slug>"`) and push if a git remote is configured. Do this immediately once check + build pass: never hold the commit/push for the outreach mockup (Step 4.4), a background job or other prospects. Later fixes go in a follow-up commit. If you added photos, also `git add public/assets lib/stock.ts`.
4. **Outreach mockups (mandatory, every prospect):** with the fresh build running locally (`npx next start -p 3123`), run
   ```bash
   node scripts/outreach-shots.mjs <slug>            # several slugs at once is fine; --base https://preview.skyearc.tech shoots live
   ```
   It writes ONE file, `../outreach/<slug>/desktop-and-phone.jpg` (the `outreach` folder next to this project, not in git): a 1920×1080 browser + phone mockup of the hero on white, the image to send with DM message #2. The user only wants this combined mockup: never add separate desktop, phone or full-page files. LOOK at `desktop-and-phone.jpg` before reporting: hero headline complete, arc underline fully drawn (raise `--wait` if it is caught mid-animation), no stray elements at the top of the phone screen. Stop the server afterwards.
   **Then upload it to Google Drive (mandatory):** with the user's Google connector (Drive tools, found with ToolSearch), upload `../outreach/<slug>/desktop-and-phone.jpg` to the Drive folder **`Outreach Mockups`** (create it once in My Drive if it doesn't exist; never make it public or change sharing) as `<slug>.jpg`, replacing any older file with that name. Keep the local copy too. If no Drive tools load in the session, say so in the report and leave the local file; don't upload through the browser.
5. **Update the outreach sheet (mandatory, every prospect):** in the user's "Contractor Outreach List" Google Sheet (link kept in Claude's memory, not in this repo), set the prospect's **Live Preview Link** (column I) to `https://preview.skyearc.tech/<slug>` and **Status** (column L) to `Preview Built - Ready to DM`. Use the user's Google connector (Sheets/Drive tools, found with ToolSearch) to write the cells directly; only if no Google tools load, fall back to Claude in Chrome. Find the row from the sheet's TSV export, write with the Name Box, then re-read to verify. If the prospect has no row, tell the user.
6. Print to the terminal:
   - **Live URL:** `https://preview.skyearc.tech/<slug>`
   - **Outreach mockup:** the Google Drive link to `Outreach Mockups/<slug>.jpg` (and the local path `../outreach/<slug>/desktop-and-phone.jpg`)
   - **Identified Gap:** The exact lead-capture leak found.
   - **Permission-First DM (3 lines, no raw link in Message #1, no hype, never promising "more leads" or revenue):** Ready to copy-paste into LinkedIn or Facebook Messenger.

---

# Reference (read before Step 3, so nothing needs troubleshooting again)

## Photo library: exact keys and files (as of 2026-11-25; re-check with `ls -R public/assets/`)

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
| `gate` | `public/assets/carpentry/photo-gate{-500,-960,}.webp` | Braced timber farm gate on a post, strap hinges | CC BY-SA 4.0 |
| `door` | `public/assets/carpentry/photo-door{-500,-960,}.webp` | Front door with glass panel and a keypad smart lock (doors, locks, handyman) | CC BY-SA 4.0 |
| `stairs` | `public/assets/carpentry/photo-stairs{-500,-960,,-hero}.webp` | New timber deck stairs with handrails and balusters, among trees | CC BY 2.0 |
| `siding` | `public/assets/remodeling/photo-siding{-500,-960,,-hero}.webp` | House with new blue fiber-cement siding and a dark shingle roof (aerial) | CC0 |
| `driveway` | `public/assets/concrete/photo-driveway{-500,-960,,-hero}.webp` | Driveway formed up with reinforcing mesh, ready to pour | CC BY-SA 4.0 |
| `sidewalk` | `public/assets/concrete/photo-sidewalk{-500,-960,}.webp` | Sidewalk forms and rebar, crew preparing the pour (gritty urban setting) | CC BY 2.0 |
| `asphalt` | `public/assets/concrete/photo-asphalt{-500,-960,}.webp` | Close-up of fresh black asphalt on a new driveway | CC BY-SA 4.0 |
| `rooftiles` | `public/assets/roofing/photo-tiles{-500,-960,,-hero}.webp` | Close-up of interlocking concrete roof tiles after rain | CC BY-SA 4.0 |
| `brokentiles` | `public/assets/roofing/photo-brokentiles{-500,-960,}.webp` | Pile of broken grey concrete roof tiles with moss | CC0 |
| `tilemoss` | `public/assets/roofing/photo-moss{-500,-960,}.webp` | Moss and lichen on a weathered cement tile (a "before" shot) | Public domain |

`{-500,-960,}` means three files: `…-500.webp`, `…-960.webp` and `….webp` (1280w). Only keys with a `-hero` file are sharp enough for the full-width hero: **`kitchen`, `plumbing`, `framing`, `stairs`, `siding`, `driveway`, `rooftiles`**. Use one of those for `hero.photo`.

Note: the key and the file stem don't always match (`rooftiles` → `photo-tiles`, `tilemoss` → `photo-moss`). Always reference the **key** in JSON.

Fit by trade: metal roofs → `roofing`; concrete/terracotta tile roofs → `rooftiles`, `brokentiles`, `tilemoss`; roofing + siding or exterior remodeling → `siding`; concrete, paving, driveways → `driveway`, `sidewalk`, `asphalt`; stairs, balustrades, handrails → `stairs`. When the company name starts with the owner's first name ("Jason Beduhn Carpentry"), the default chat label is "Ask Jason": set `assistantName` to the business name.

`assetFolder` sets (used when a service has no `photo`, in order):

| assetFolder | Photos |
|---|---|
| `remodeling` | kitchen, bathroom, tile |
| `carpentry` | framing, deck, pergola |
| `roofing` | roofing, framing, deck |
| `plumbing` | plumbing, bathroom, kitchen |
| `electrical` | electrical, kitchen, framing |
| `builders` | framing, kitchen, deck |
| `concrete` | driveway, sidewalk, asphalt |

Pick the 3 service photos to match the 3 real services (a decking service gets `deck`, not `kitchen`). Never use the same photo on two cards unless the library has nothing closer.

### Adding a stand-in photo (only when the library has nothing that fits)
1. Search Wikimedia Commons by API (free licences only: CC0, CC BY, CC BY-SA, public domain):
   `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch=<terms>&gsrlimit=12&prop=imageinfo&iiprop=size|extmetadata`
2. Download through `https://commons.wikimedia.org/w/thumb.php?f=<File_name.jpg>&w=1280` with a real User-Agent (`SkyeArcPreviewBuilder/1.0 (https://skyearc.tech)`). `Special:FilePath` and direct `upload.wikimedia.org` links return HTTP 429 "Too many requests". Wait 2-3 s between downloads.
3. LOOK at the photo before using it (it must show the trade, no people's faces, no branding). Also check the author name: skip photos whose uploader looks like a trade business in the prospect's area (e.g. "ChicagoConcrete" for a Chicago concrete prospect), because the credit shows on the page.
4. Convert with sharp to `public/assets/<niche>/photo-<name>-500.webp`, `-960.webp` and `.webp` (1280w), quality ~74. For a hero, also `-hero.webp` at 2200w (`withoutEnlargement`).
5. Add an entry to `STOCK` in `lib/stock.ts` (`base: "<niche>/photo-<name>"`, `w`, `h`, `large`, optional `hero`, `alt`, `by`, `licence`, `licenceUrl`, `page`), and to `NICHES` if it suits a niche. Add a matching entry to `public/assets/credits.json` (`file`/`files` are bare filenames, no folder; `id`, `alt`, `by`, `licence`, `licenceUrl`, `page`, `source: "Wikimedia Commons"`).
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

How to find them: the client's website CSS (`theme-color`, button and header colours), their logo, van wraps or signage in their Google Business Profile photos (look, don't download). Record the source in `_sources.brand`. Check contrast: white text on `primary` must read clearly (4.5:1); if not, set `primaryInk`. `dark` must be dark enough for white text. **No brand online (no site, socials or logo)?** Use the colours of their own work: screenshot their Google Business Profile with headless Chrome, sample the cover photo below the search box (k-means on a downscaled crop with sharp), and build the palette from it: `dark` = the deepest tone, `primary` = the strongest mid tone (e.g. Perth's blue trusses #305b83), `accent` = the warm/light highlight (terracotta #caa183, marble #d1d1c8). Never download or reuse the photo itself. Record it in `_sources.brand` as "sampled from their listing photo, not an official brand; confirm with the owner". Only if there's no usable photo either, omit `brand` and the defaults apply.
- Contrast check every palette: white on `primary` ≥ 4.5:1, white on `dark` ≥ 4.5:1, `accent` on `dark` ≥ 4.5:1.
- The concept logo uses the same palette (e.g. marble mark on matte black for Moxey, blue truss on charcoal for Perth).
- Brand tokens are re-derived in `.brand-scope` (the page wrapper). Never derive brand colours only on `:root`: CSS resolves `var()` where it's declared, so the client colours wouldn't reach them.

## Permanent fixes already in the code (do NOT re-troubleshoot these)
- **Broken/blank images:** `resolvePhoto()` (`lib/stock-server.ts`) checks every photo's files exist at build time and falls back to `DEFAULT_PHOTO` (`framing`). Service cards render through `components/preview/SafeImg.tsx` with `loading="eager"` and an `onError` swap to the default photo (it also catches errors that fired before hydration). A wrong key can never produce a grey box, but fix it anyway: the checker reports it.
- **Photo paths:** the library lives in `public/assets/<niche>/`. There is no `public/stock/` any more; the checker errors on `/stock/`.
- **Nav links:** anchors live in `lib/nav.ts`. Never export plain data from a `"use client"` file and import it into the server page (the build fails with `NAV_LINKS.map is not a function`).
- **One page only:** no `/about`, `/services`, `/contact` routes. Nav = `#home`, `#about` (Who We Help), `#services`, `#contact`; Privacy Policy and Terms show an "included in full launch build" toast.
- **Sticky header:** the concept banner and nav are in normal flow (sticky), so they never overlap the hero. Long company names wrap to 2 lines on phones; the header CTA hides on phones (it's in the drawer and bottom bar).
- **Wording safety:** CTA defaults to "Get a quote"/"Get an estimate". Only write "Free quote" if the contractor publicly offers it. Never write "no hidden fees", guarantees, "more leads" or revenue promises (the checker errors on these). The licence FAQ offers to send details unless `company.credential` is published.
- **GHL embeds:** empty URLs show working mockups, not placeholders. The quick hero form posts to `/api/quote`; without a webhook (501) it pre-fills the hub form and scrolls to `#hub`.
- **Logo:** every preview gets a designed concept mark from Step 3b (`logo.svg`); without one it falls back to an original typographic badge (`components/preview/Logo.tsx`: initials under a roof line in the brand colour, plus name and tagline), also used as the browser tab icon. The footer notes it is a concept mark. Just fill `logo.initials` / `logo.tagline`; defaults work if omitted.
- **Chat widget speaks as the CLIENT, never "Skye"** (that's SkyeArc's own name): the button reads "Ask <first word of the company>" ("Ask Moxey", "Ask Perth"); override with `assistantName` when the first word reads badly ("FIX" → `"assistantName": "Fix My Roof"`). Give the name only: the button adds "Ask" itself. Use the business name, not the owner's first name, so the AI never reads as the owner replying. `skyeGreeting` must say "I'm the <Company> assistant", and `check:preview` errors if it says Skye.
- **Chat position on phones:** hidden over the hero (it has its own call/quote buttons), a round button just above the Call/Quote bar while scrolling, and at the bottom edge in the contact section. `MobileBar` sets `html[data-bar]` / `html[data-hero]` and `globals.css` positions it. Don't move it by hand per prospect.
- **Problem-tile icons are automatic and specific, never a generic "!" alert:** each pain point gets an icon from its TITLE (body only as fallback) via `lib/problem-icons.ts`: calls/replies → phone with a cross, pricing/costs/quotes → price tag, timelines/no-shows/waits → clock, sloppy/uneven finishing → uneven tiles, mess/sites/debris → broom. Write pain-point titles that name the problem plainly ("Unreturned calls & slow quotes", "Vague pricing & surprise costs", "Missed timelines", "Messy job sites"); `check:preview` warns if a title matches no icon. New kind of pain point? Add a rule + icon instead of reusing a wrong one.
- **Robots:** `noindex, nofollow` is hard-coded in `app/layout.tsx`, `X-Robots-Tag` is set in `next.config.ts`, and `public/robots.txt` disallows all. Don't touch.

## Deploy (auto)
- Pushing to `preview-site` on github.com/besogolbb/preview-skyearc auto-deploys on EasyPanel (service preview-skyearc, Dockerfile, proxy port 80).
- How it works: the GitHub webhook calls `https://panel.benedictjan.com/api/deploy/<token>`. That host goes through Cloudflare (the server firewall CF-LOCK only accepts Cloudflare IPs), and a Cloudflare Access **Bypass** app for path `api/deploy/*`, limited to GitHub's hook IP ranges, lets it past the Access login that protects the dashboard. If a push doesn't deploy, check GitHub → Settings → Webhooks → Recent Deliveries: 302 = Access is blocking (bypass app missing/expired), 403 = WAF/bot rule, timeout = it's pointing at the old `*.easypanel.host` address.
- `https://preview.skyearc.tech/version.txt` shows which build is live; bump it when you need to confirm a deploy.
- Your PC may cache old DNS for preview.skyearc.tech; prospects are not affected.

## Research tactics that work
- **Google Business Profile, basics:** WebFetch on a Maps URL returns an empty JS shell. A headless-Chrome render (design-taste-frontend's `shoot.mjs --url "<maps url>?hl=en" --w 1440 --h 900 --wait 8000`) shows name, rating, category, phone, hours and the drawn service area.
- **Reviews ARE usually there, don't assume there are none.** Automated browsers get Google's *limited view*: no Reviews tab, no review count, no review text. That says nothing about the business: Moxey looked review-less to the render but has 5.0 from 36 reviews. Never try to get around the limited view (no faking a normal browser, no scraping tricks).
- **Get rating, count and reviews legitimately. Default = Claude in Chrome (autonomous, free):** if the `mcp__claude-in-chrome__*` tools are available (Chrome open, extension connected), load them in ONE ToolSearch, `tabs_context_mcp {createIfEmpty:true}`, navigate to `https://www.google.com/maps/search/<Name>+<City>?hl=en`, open the **Reviews** tab, click the "See more" buttons, `get_page_text`, and check each chosen review's stars by screenshot. Take rating, count, topic chips and the exact place URL (strip `entry=`/`g_ep=` params) for `google.profileUrl`. Pick up to 3 COMPLETE 5★ reviews that cover different jobs; skip any text still ending in "… More" or "…". Close the tab when done. This is the user's own browser, viewed like a person would; it is NOT a way around the limited view, so don't use it for bulk scraping. Worked example: Moxey = 5.0 / 36, reviews by Melissa Picchini, Lance S, Syd Caruthers.
- **If Chrome isn't connected:**
  1. **Ask the user** (about 2 minutes, no cost): "Open <Business> on Google Maps → Reviews tab and paste: rating + review count, the topic chips, and 2–3 good reviews with **More** clicked (name, stars, date, full text); optionally Share → Copy link." Parse the paste into `google` (+ `profileUrl` if given) and up to 3 verbatim `realReviews`. Keep building the rest of the preview while waiting; ship with `google: null` / no reviews only if the user can't provide them.
  2. **Optional, only if a key exists:** `node scripts/google-reviews.mjs "<Name> <City>" --write <slug>` uses the official Google Places API (New) (`GOOGLE_PLACES_API_KEY` in `.env.local`; needs a Google Cloud billing account, so the user chose not to use it for now). Check the `matched` business is right.
  - Never use scraping services or browser disguises (ScrapingBee and similar advertise CAPTCHA bypass / proxy rotation against Google: not allowed).
- **Verbatim only:** `realReviews` text must be complete and unedited. A review ending in "… More" is truncated: don't use it until the full text is pasted. Never paraphrase or merge reviews.
- **Review topic chips are real facts too** ("attention to detail 9", "punctuality 8"): they can shape the Why-us themes and trust line, without quoting a review.
- **Directories that list AU tradies:** tradieladder.com.au (rating + Google review count, dated), carpentersau.one, avenueperth.com, Houzz, Oneflare. whereis.com returns 403. Cross-check the phone across at least 2 sources and record each in `_sources`.
- A company domain listed on a directory may not resolve (that is often the lead-capture gap).

## Verify before reporting
1. `npm run check:preview -- <slug>` → `✓`.
2. `npm run build` → the slug appears under `/[slug]` as `○` (static).
3. `../outreach/<slug>/desktop-and-phone.jpg` exists and looks right (Step 4.4).
4. Look at the page at 1440 and 390: hero, the 3 service photos, the hub. The design-taste-frontend `shoot.mjs` full-page capture can drop content right above each 900/1800/2700 px stitch seam; if a heading looks cut there, crop that section at 390 or scroll to it before calling it a bug.
