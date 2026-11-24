// Turn a finished black concept mark (viewBox 0 0 256 256) into the site logo:
// the mark in one colour, centred on a rounded tile in the client's colour.
//   node scripts/make-logo-tile.mjs <mark.svg> <slug> --bg "#282823" --fg "#d1d1c8" [--scale 0.6] [--dy 0]
// Writes public/assets/logos/<slug>.svg. Works for filled and stroked marks.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const args = process.argv.slice(2);
const [markFile, slug] = args;
const opt = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
const bg = opt("--bg"), fg = opt("--fg");
const scale = Number(opt("--scale", "0.6")), dy = Number(opt("--dy", "0"));
if (!markFile || !slug || !/^#[0-9a-f]{6}$/i.test(bg ?? "") || !/^#[0-9a-f]{6}$/i.test(fg ?? "") || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('usage: node scripts/make-logo-tile.mjs <mark.svg> <slug> --bg "#rrggbb" --fg "#rrggbb" [--scale 0.6] [--dy 0]');
  process.exit(1);
}

const src = readFileSync(markFile, "utf8");
if (!/viewBox="0 0 256 256"/.test(src)) throw new Error("mark must use viewBox=\"0 0 256 256\"");
if (/<text[\s>]/.test(src)) throw new Error("mark contains live <text>: convert letterforms to paths");
const title = (src.match(/<title>([^<]*)<\/title>/) ?? [, `${slug} concept logo`])[1];
const inner = src
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .replace(/<title>[\s\S]*?<\/title>/, "")
  .replace(/(fill|stroke)="#(?:000|000000|0{6})"/gi, (_, a) => `${a}="${fg}"`)
  .trim();

const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><title>${title.replace(/mark$/i, "logo")}</title><rect width="256" height="256" rx="56" fill="${bg}"/><g transform="translate(128 ${128 + dy}) scale(${scale}) translate(-128 -128)">${inner}</g></svg>\n`;
mkdirSync("public/assets/logos", { recursive: true });
writeFileSync(`public/assets/logos/${slug}.svg`, out);
console.log(`wrote public/assets/logos/${slug}.svg  (bg ${bg}, mark ${fg}, scale ${scale})`);
