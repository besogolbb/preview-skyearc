import { existsSync } from "node:fs";
import path from "node:path";
import { DEFAULT_PHOTO, STOCK, stockSrc, type StockKey, type StockPhoto } from "./stock";

const PUBLIC = path.join(process.cwd(), "public");

/** A designed logo path from the JSON, only if the file exists under public/ (else undefined: initials badge). */
export function resolveLogo(src: string | undefined) {
  if (!src || !/^\/assets\/logos\/[a-z0-9-]+\.svg$/.test(src)) return undefined;
  return existsSync(path.join(PUBLIC, src)) ? src : undefined;
}

/** True when every file this photo's srcset points at is on disk. */
export function photoFilesExist(p: StockPhoto) {
  const { srcSet } = stockSrc(p);
  return srcSet
    .split(",")
    .map((s) => s.trim().split(" ")[0])
    .every((url) => existsSync(path.join(PUBLIC, url)));
}

/**
 * Resolve a photo key from a preview JSON to a photo whose files exist.
 * Unknown keys and missing files fall back to the default construction photo,
 * so a typo in a prospect file can never render an empty image box.
 */
export function resolvePhoto(key: string | undefined): { key: StockKey; photo: StockPhoto; fellBack: boolean } {
  if (key && key in STOCK) {
    const photo = STOCK[key as StockKey] as StockPhoto;
    if (photoFilesExist(photo)) return { key: key as StockKey, photo, fellBack: false };
  }
  if (key) console.warn(`[preview] photo "${key}" is unknown or its files are missing; using "${DEFAULT_PHOTO}"`);
  return { key: DEFAULT_PHOTO, photo: STOCK[DEFAULT_PHOTO] as StockPhoto, fellBack: !!key };
}
