#!/usr/bin/env node
// Outreach mockup for a preview: ONE image, ../outreach/<slug>/desktop-and-phone.jpg (next to this project):
// a 1920x1080 browser frame + phone frame of the hero on white, for DM message #2. Nothing else is kept;
// the raw screens stay in .taste-skill/outreach-tmp.
//
//   node scripts/outreach-shots.mjs <slug> [<slug> ...] [--base http://localhost:3123] [--wait 4000]
//
// --base defaults to http://localhost:3123: run `npm run build && npx next start -p 3123` first, so the
// images match the committed JSON even before the live deploy finishes. Use --base https://preview.skyearc.tech
// to shoot the live site. Screens are taken with the design-taste-frontend shoot.mjs (its own headless Chrome);
// --wait lets the hero entrance (arc underline, form) finish before the first screen is captured.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
const slugs = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
const base = opt("--base", "http://localhost:3123").replace(/\/$/, "");
const wait = opt("--wait", "4000");
if (!slugs.length || slugs.some((s) => !/^[a-z0-9-]+$/.test(s))) {
  console.error("usage: node scripts/outreach-shots.mjs <slug> [<slug> ...] [--base http://localhost:3123] [--wait 4000]");
  process.exit(1);
}

const shootCandidates = [
  ".agents/skills/design-taste-frontend/scripts/shoot.mjs",
  path.join(os.homedir(), ".claude/skills/design-taste-frontend/scripts/shoot.mjs"),
];
const shoot = shootCandidates.find((p) => fs.existsSync(p));
if (!shoot) { console.error("shoot.mjs not found (design-taste-frontend skill)"); process.exit(1); }

const tmp = path.resolve(".taste-skill/outreach-tmp");
fs.mkdirSync(tmp, { recursive: true });

function capture(url, w, h, out) {
  execFileSync(process.execPath, [shoot, "--url", url, "--w", String(w), "--h", String(h), "--out", out,
    "--profile", ".taste-skill/chrome-outreach", "--no-tiles", "--wait", wait], { stdio: ["ignore", "ignore", "inherit"], timeout: 240000 });
}

const roundMask = (w, h, r) => Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}"/></svg>`);
async function rounded(input, w, h, r) {
  return sharp(input).resize(w, h, { fit: "cover", position: "top" })
    .composite([{ input: roundMask(w, h, r), blend: "dest-in" }]).png().toBuffer();
}
const shadow = (W, H, x, y, w, h, r) => sharp(Buffer.from(
  `<svg width="${W}" height="${H}"><defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22"/></filter></defs>` +
  `<rect x="${x}" y="${y + 18}" width="${w}" height="${h}" rx="${r}" fill="#0b1220" fill-opacity="0.22" filter="url(#s)"/></svg>`)).png().toBuffer();

for (const slug of slugs) {
  const url = `${base}/${slug}`;
  const dir = path.resolve("..", "outreach", slug);
  fs.mkdirSync(dir, { recursive: true });
  const dFull = path.join(tmp, `${slug}-1440.png`), pFull = path.join(tmp, `${slug}-390.png`);
  console.log(`${slug}: shooting ${url}`);
  capture(url, 1440, 900, dFull);
  capture(url, 390, 844, pFull);

  const deskHero = await sharp(dFull).extract({ left: 0, top: 0, width: 1440, height: 900 }).png().toBuffer();
  const phoneHero = await sharp(pFull).extract({ left: 0, top: 0, width: 390, height: 844 }).png().toBuffer();

  // 1920x1080 mockup, same layout as the earlier sets: browser at left, phone at right.
  const W = 1920, H = 1080;
  const dx = 118, dy = 152, dw = 1240, dh = Math.round(900 * dw / 1440), dr = 16;
  const px = 1398, py = 117, pw = 404, ph = 846, pr = 52, bez = 12;
  const sw = pw - 2 * bez, sh = ph - 2 * bez;
  const desk = await rounded(deskHero, dw, dh, dr);
  const phoneScreen = await rounded(phoneHero, sw, sh, pr - bez);
  const phoneBody = await sharp(Buffer.from(`<svg width="${pw}" height="${ph}"><rect width="${pw}" height="${ph}" rx="${pr}" fill="#111214"/></svg>`)).png().toBuffer();
  await sharp({ create: { width: W, height: H, channels: 3, background: "#ffffff" } })
    .composite([
      { input: await shadow(W, H, dx, dy, dw, dh, dr), left: 0, top: 0 },
      { input: await shadow(W, H, px, py, pw, ph, pr), left: 0, top: 0 },
      { input: desk, left: dx, top: dy },
      { input: phoneBody, left: px, top: py },
      { input: phoneScreen, left: px + bez, top: py + bez },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(dir, "desktop-and-phone.jpg"));
  console.log(`  wrote ${path.relative(process.cwd(), path.join(dir, "desktop-and-phone.jpg"))}`);
}
