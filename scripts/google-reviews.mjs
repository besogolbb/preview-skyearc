// Google rating, review count, reviews and listing link via the OFFICIAL
// Google Places API (New). No scraping, no browser.
//   node scripts/google-reviews.mjs "<Business name> <City>"          -> prints JSON
//   node scripts/google-reviews.mjs "<Business name> <City>" --write <slug>
//        -> also writes google{} and realReviews[] into data/previews/<slug>.json
// Needs GOOGLE_PLACES_API_KEY (env var or .env.local), restricted to Places API (New).
// Google returns up to 5 reviews ("most relevant"), in full. Display them with the
// author name and "Google" (the review card already does), per Google's attribution rules.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const query = args[0];
const wi = args.indexOf("--write");
const slug = wi > -1 ? args[wi + 1] : null;
if (!query || query.startsWith("--")) {
  console.error('usage: node scripts/google-reviews.mjs "<Business name> <City>" [--write <slug>]');
  process.exit(1);
}

function keyFromEnvFiles() {
  for (const f of [".env.local", ".env"]) {
    if (!existsSync(f)) continue;
    const m = readFileSync(f, "utf8").match(/^\s*GOOGLE_PLACES_API_KEY\s*=\s*"?([^"\r\n]+)"?/m);
    if (m) return m[1].trim();
  }
  return null;
}
const KEY = process.env.GOOGLE_PLACES_API_KEY || keyFromEnvFiles();
if (!KEY) {
  console.error("No GOOGLE_PLACES_API_KEY: add it to .env.local (see .claude/skills/build-preview/SKILL.md).");
  process.exit(2);
}

async function call(url, init, mask) {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": mask, ...(init?.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Places API ${res.status}: ${body?.error?.message ?? res.statusText}`);
  return body;
}

// 1) find the place
const found = await call(
  "https://places.googleapis.com/v1/places:searchText",
  { method: "POST", body: JSON.stringify({ textQuery: query, languageCode: "en", pageSize: 3 }) },
  "places.id,places.displayName,places.formattedAddress",
);
const places = found.places ?? [];
if (!places.length) { console.error(`No Google place found for "${query}".`); process.exit(3); }
const place = places[0];

// 2) details: rating, count, reviews, link
const d = await call(
  `https://places.googleapis.com/v1/places/${encodeURIComponent(place.id)}?languageCode=en`,
  { method: "GET" },
  "id,displayName,formattedAddress,rating,userRatingCount,googleMapsUri,nationalPhoneNumber,websiteUri,reviews",
);

const reviews = (d.reviews ?? [])
  .map((r) => ({
    author: r.authorAttribution?.displayName ?? "Google user",
    rating: r.rating,
    text: (r.originalText?.text ?? r.text?.text ?? "").trim(),
    date: r.relativePublishTimeDescription ?? undefined,
  }))
  .filter((r) => r.text);

const out = {
  matched: { name: d.displayName?.text, address: d.formattedAddress, phone: d.nationalPhoneNumber, website: d.websiteUri ?? null },
  otherMatches: places.slice(1).map((p) => `${p.displayName?.text} — ${p.formattedAddress}`),
  google: d.userRatingCount ? { rating: d.rating, reviewCount: d.userRatingCount, profileUrl: d.googleMapsUri } : null,
  realReviews: reviews,
};
console.log(JSON.stringify(out, null, 2));
if (out.otherMatches.length) console.error(`\nCheck it's the right business: other matches were ${out.otherMatches.join(" | ")}`);

if (slug) {
  const f = `data/previews/${slug}.json`;
  if (!existsSync(f)) { console.error(`${f} not found`); process.exit(4); }
  const j = JSON.parse(readFileSync(f, "utf8"));
  if (out.google) j.google = out.google;
  // keep the strongest few: 4-5 stars, longest first, max 3 (the page shows 3)
  j.realReviews = reviews.filter((r) => r.rating >= 4).sort((a, b) => b.text.length - a.text.length).slice(0, 3);
  j._sources = j._sources ?? {};
  const today = new Date().toISOString().slice(0, 10);
  j._sources.google = `Google Places API (New), ${today}: ${out.matched.name}, ${out.matched.address}. ${out.google ? `${out.google.rating} stars from ${out.google.reviewCount} reviews.` : "No rating."}`;
  j._sources.reviews = `Google Places API (New), ${today}: ${j.realReviews.length} verbatim review(s), full text, shown with author + Google attribution.`;
  writeFileSync(f, JSON.stringify(j, null, 2) + "\n");
  console.error(`\nwrote google{} and ${j.realReviews.length} realReviews into ${f}`);
}
