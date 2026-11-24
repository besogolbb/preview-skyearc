import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import type { Preview } from "./preview-shared";

export * from "./preview-shared";

const DIR = path.join(process.cwd(), "data", "previews");
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function listSlugs(): Promise<string[]> {
  const files = await readdir(DIR);
  return files
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map((f) => f.slice(0, -5))
    .filter((s) => SLUG_RE.test(s));
}

export async function getPreview(slug: string): Promise<Preview | null> {
  "use cache";
  cacheLife("minutes");
  if (!SLUG_RE.test(slug)) return null;
  try {
    const raw = await readFile(path.join(DIR, `${slug}.json`), "utf8");
    const data = JSON.parse(raw) as Preview;
    return { ...data, slug };
  } catch {
    return null;
  }
}

