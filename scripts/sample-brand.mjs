// Sample a client palette from a screenshot of THEIR OWN listing photo.
//   node scripts/sample-brand.mjs <screenshot.png> [left top width height]
// Default crop = the cover photo of a Google Maps place panel rendered at
// 1440x900, below the search box (82 66 404 180).
// Prints the dominant colours, a suggested { primary, dark, accent } and the
// contrast checks. Only colours are measured: never save or reuse the photo.
import sharp from "sharp";

const [file, ...box] = process.argv.slice(2);
if (!file) {
  console.error("usage: node scripts/sample-brand.mjs <screenshot.png> [left top width height]");
  process.exit(1);
}
const [left, top, width, height] = box.length === 4 ? box.map(Number) : [82, 66, 404, 180];

const { data } = await sharp(file).extract({ left, top, width, height }).resize(80, 40, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const px = [];
for (let i = 0; i < data.length; i += 3) px.push([data[i], data[i + 1], data[i + 2]]);

// k-means, k = 7
const K = 7;
let c = Array.from({ length: K }, (_, j) => px[Math.floor((j * px.length) / K)].slice());
for (let it = 0; it < 20; it++) {
  const s = c.map(() => [0, 0, 0, 0]);
  for (const p of px) {
    let b = 0, bd = Infinity;
    c.forEach((q, j) => { const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2; if (d < bd) { bd = d; b = j; } });
    s[b][0] += p[0]; s[b][1] += p[1]; s[b][2] += p[2]; s[b][3]++;
  }
  c = s.map((t, j) => (t[3] ? [t[0] / t[3], t[1] / t[3], t[2] / t[3], t[3]] : c[j]));
}
const hex = (v) => "#" + v.slice(0, 3).map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
const lum = (h) => {
  const v = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const sat = (v) => { const mx = Math.max(...v.slice(0, 3)), mn = Math.min(...v.slice(0, 3)); return mx ? (mx - mn) / mx : 0; };

const cols = c.sort((a, b) => b[3] - a[3]).map((v) => ({ hex: hex(v), share: Math.round((v[3] / px.length) * 100), sat: sat(v), lum: lum(hex(v)) }));
console.log("dominant:", cols.map((x) => `${x.hex} (${x.share}%)`).join("  "));

// dark = deepest tone; primary = most saturated mid tone that carries white text;
// accent = lightest of the warm/saturated rest that reads on dark.
const dark = [...cols].sort((a, b) => a.lum - b.lum)[0];
const mids = cols.filter((x) => x !== dark && cr("#ffffff", x.hex) >= 4.5);
const primary = [...(mids.length ? mids : cols.filter((x) => x !== dark))].sort((a, b) => b.sat - a.sat || b.share - a.share)[0];
const rest = cols.filter((x) => x !== dark && x !== primary && cr(x.hex, dark.hex) >= 4.5);
const accent = [...(rest.length ? rest : cols)].sort((a, b) => b.sat - a.sat || b.lum - a.lum)[0];

const pal = { primary: primary.hex, dark: dark.hex, accent: accent.hex };

// Low-colour photo (marble, concrete, white rooms): the clusters are all greys,
// which makes a flat black-and-white page. Take the hue of the most colourful
// 8% of pixels and build a saturated primary/accent from it instead.
if (Math.max(...cols.map((x) => x.sat)) < 0.25) {
  const hsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    const h = (mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60;
    return [h, s, l];
  };
  const toHex = (h, s, l) => {
    const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return "#" + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
  };
  const top = px.map((p) => hsl(...p)).filter(([, , l]) => l > 0.15 && l < 0.85).sort((a, b) => b[1] - a[1]).slice(0, Math.floor(px.length * 0.08));
  let x = 0, y = 0;
  for (const [h] of top) { x += Math.cos((h * Math.PI) / 180); y += Math.sin((h * Math.PI) / 180); }
  const H = Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
  pal.primary = toHex(H, 0.62, 0.52);
  pal.accent = toHex(H, 0.68, 0.63);
  const inkOk = cr("#ffffff", pal.primary) < 4.5;
  if (inkOk) pal.primaryInk = "#1d1c18";
  console.log(`\nlow-colour photo: hidden hue ${H}° (from its most colourful 8% of pixels)`);
  console.log(`  primary ${pal.primary}${inkOk ? " with dark text #1d1c18 (white fails on it)" : ""}, accent ${pal.accent}, dark stays ${pal.dark}`);
}
console.log("\nsuggested brand:", JSON.stringify(pal));
const checks = [
  [`${pal.primaryInk ? "dark text" : "white"} on primary`, cr(pal.primaryInk ?? "#ffffff", pal.primary)],
  ["white on dark", cr("#ffffff", pal.dark)],
  ["accent on dark", cr(pal.accent, pal.dark)],
  // small brand text on white uses the primary darkened 42% (--p-accent-text in globals.css)
  ["brand text on white", cr("#" + [1, 3, 5].map((i) => Math.round(parseInt(pal.primary.slice(i, i + 2), 16) * 0.58).toString(16).padStart(2, "0")).join(""), "#ffffff")],
];
for (const [n, v] of checks) console.log(`  ${v >= 4.5 ? "✓" : "✗"} ${n}: ${v.toFixed(1)}:1`);
console.log("\nJudge it by eye against the photo: adjust a suggestion if it misses the obvious colour (e.g. darken a too-light primary), then re-check contrast.");
if (checks.some(([, v]) => v < 4.5)) process.exitCode = 2;
