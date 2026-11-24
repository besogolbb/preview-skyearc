// Validate data/previews/<slug>.json files before they ship.
//   npm run check:preview                 -> every preview
//   npm run check:preview -- <slug> [...] -> just those
// Checks: required fields and counts, market wording, photo keys exist in
// lib/stock.ts AND every file they point at is on disk under public/assets,
// assetFolder is a known niche, no raw image paths, no "/stock/" leftovers,
// reviews have verbatim text, Google numbers are sane. Exits 1 on any error.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const { STOCK, NICHES, stockSrc, heroSrc } = await import(new URL("../lib/stock.ts", import.meta.url).href);

const dir = path.join(root, "data", "previews");
const args = process.argv.slice(2);
const slugs = args.length ? args : readdirSync(dir).filter((f) => f.endsWith(".json") && !f.startsWith("_")).map((f) => f.slice(0, -5));

const urlsOf = (srcSet) => srcSet.split(",").map((s) => s.trim().split(" ")[0]);
const fileOk = (url) => existsSync(path.join(root, "public", url));

let failed = 0;
for (const slug of slugs) {
  const errs = [];
  const warns = [];
  const file = path.join(dir, `${slug}.json`);
  let p;
  try {
    p = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    console.log(`✗ ${slug}: cannot read/parse ${file}: ${e.message}`);
    failed++;
    continue;
  }
  const need = (cond, msg) => !cond && errs.push(msg);
  const count = (arr, n, name, exact = true) =>
    need(Array.isArray(arr) && (exact ? arr.length === n : arr.length >= n), `${name}: need ${exact ? "exactly" : "at least"} ${n}, got ${Array.isArray(arr) ? arr.length : "none"}`);

  need(p.market === "AU" || p.market === "US", `market must be "AU" or "US"`);
  need(p.company?.name && p.company?.trade && p.company?.city, "company.name, company.trade and company.city are required");
  need(p.hero?.headline && p.hero?.subhead, "hero.headline and hero.subhead are required");
  count(p.hero?.trustLine, 3, "hero.trustLine");
  need(p.quoteField?.label && p.quoteField?.options?.length >= 3, "quoteField needs a label and 3+ options");
  need(p.about?.headline && p.about?.body && p.about?.closing, "about.headline/body/closing are required");
  count(p.about?.cards, 3, "about.cards");
  need(p.problems?.headline && p.problems?.bridge, "problems.headline and problems.bridge are required");
  count(p.problems?.points, 4, "problems.points");
  need(p.solutions?.headline, "solutions.headline is required");
  count(p.solutions?.services, 3, "solutions.services");
  need(p.process?.headline, "process.headline is required");
  count(p.process?.steps, 4, "process.steps");
  need(p.why?.headline, "why.headline is required");
  count(p.why?.themes, 4, "why.themes");
  need(Array.isArray(p.realReviews), "realReviews must be an array (empty if none verified)");
  need(p.finalCta?.headline && p.finalCta?.body && p.finalCta?.microcopy, "finalCta.headline/body/microcopy are required");
  count(p.faq, 5, "faq");
  need(p.embeds && "ghlFormUrl" in p.embeds && "ghlCalendarUrl" in p.embeds, "embeds.ghlFormUrl and embeds.ghlCalendarUrl must exist (empty string = mockup)");

  if (p.logo?.initials !== undefined) need(/^[A-Za-z0-9&]{1,3}$/.test(p.logo.initials), `logo.initials must be 1-3 letters, got "${p.logo.initials}"`);
  if (p.logo?.svg !== undefined) {
    if (!/^\/assets\/logos\/[a-z0-9-]+\.svg$/.test(p.logo.svg)) errs.push(`logo.svg must look like /assets/logos/<slug>.svg, got "${p.logo.svg}"`);
    else if (!fileOk(p.logo.svg)) errs.push(`logo.svg points at ${p.logo.svg}, which is not on disk`);
  } else warns.push("no logo.svg: the initials badge is used (design a mark with the logo-design skill)");
  if (!p.logo) warns.push("no logo block: initials/tagline will be generated from the name and trade");

  for (const key of ["primary", "dark", "accent", "primaryInk"]) {
    const v = p.brand?.[key];
    if (v !== undefined) need(/^#[0-9a-fA-F]{6}$/.test(v), `brand.${key} must be a 6-digit hex like #2478CC, got "${v}"`);
  }
  if (!p.brand) warns.push("no brand colours: run Step 1b (their brand, else sample-brand.mjs on their listing photo); defaults are the last resort");
  else if (!p._sources?.brand) errs.push("brand is set but _sources.brand doesn't say where the colours came from");
  if (/#07213f|#044696|#23bdf5|#fc7a58/i.test(JSON.stringify(p.brand ?? {}))) errs.push("brand uses SkyeArc's own colours: previews take the CLIENT's colours");

  if (/Skye/.test(p.skyeGreeting ?? "") || /Skye/i.test(p.assistantName ?? "")) errs.push("the chat says 'Skye': it must speak as the client (assistantName / skyeGreeting)");

  // Photos: keys only, every file on disk.
  if (p.assetFolder !== undefined) need(p.assetFolder in NICHES, `assetFolder "${p.assetFolder}" is not one of: ${Object.keys(NICHES).join(", ")}`);
  const keys = [
    ["hero.photo", p.hero?.photo],
    ...(p.solutions?.services ?? []).map((s, i) => [`solutions.services[${i}].photo`, s.photo]),
  ];
  for (const [where, key] of keys) {
    if (key === undefined) continue;
    if (typeof key === "string" && /[/.]/.test(key)) {
      errs.push(`${where}: "${key}" looks like a file path. Use a photo key: ${Object.keys(STOCK).join(", ")}`);
      continue;
    }
    if (!(key in STOCK)) {
      errs.push(`${where}: unknown photo key "${key}". Valid keys: ${Object.keys(STOCK).join(", ")}`);
      continue;
    }
    const ph = STOCK[key];
    const urls = where === "hero.photo" ? urlsOf(heroSrc(ph).srcSet) : urlsOf(stockSrc(ph).srcSet);
    for (const u of urls) if (!fileOk(u)) errs.push(`${where}: "${key}" points at ${u}, which is not on disk`);
  }
  const svcNoPhoto = (p.solutions?.services ?? []).filter((s) => !s.photo).length;
  if (svcNoPhoto && !p.assetFolder) warns.push(`${svcNoPhoto} service(s) have no photo and there is no assetFolder: they will use the default photo`);

  const raw = readFileSync(file, "utf8");
  if (raw.includes("/stock/")) errs.push(`contains "/stock/": the photo library moved to public/assets/<niche>/`);

  // Facts.
  for (const [i, r] of (p.realReviews ?? []).entries()) {
    need(r.author && r.text?.trim() && r.rating >= 1 && r.rating <= 5, `realReviews[${i}] needs author, verbatim text and a 1-5 rating`);
  }
  if (p.google) {
    need(p.google.rating > 0 && p.google.rating <= 5 && p.google.reviewCount > 0, "google.rating must be 0-5 and reviewCount > 0 (or set google to null)");
    need(/^https:\/\/(www\.)?google\.[a-z.]+\/maps|^https:\/\/maps\.app\.goo\.gl\//.test(p.google.profileUrl ?? ""), "google.profileUrl must be the real Google Maps listing link");
  }
  if (!p._sources) warns.push("no _sources block: record where each fact came from");

  // Wording.
  const text = JSON.stringify({ ...p, _sources: undefined, gap: undefined });
  if (p.market === "AU" && /\bestimates?\b/i.test(text)) warns.push(`AU preview uses "estimate": AU says "quote"`);
  if (/\bfree (quote|estimate)/i.test(text)) warns.push(`says "free quote/estimate": only if the contractor actually offers it`);
  if (/no hidden fees|guarantee|more leads|double your/i.test(text)) errs.push(`contains a promise claude.md forbids (no hidden fees / guarantee / more leads / revenue)`);

  if (errs.length) {
    failed++;
    console.log(`✗ ${slug}`);
    for (const e of errs) console.log(`    error: ${e}`);
  } else console.log(`✓ ${slug}`);
  for (const w of warns) console.log(`    warn:  ${w}`);
}
process.exit(failed ? 1 : 0);
