/**
 * Concept logo: an original typographic mark (initials under a roof line) plus
 * the company name and a short trade line. claude.md: never use a prospect's
 * own logo files, so every preview gets this clean stand-in instead.
 * No hooks, so it works in server and client components.
 */

const SKIP = new Set(["and", "&", "the", "of", "co", "co.", "pty", "ltd", "llc", "inc"]);

/** "Perth Carpentry and Roofing" -> "PC"; explicit initials win. */
export function initialsFor(name: string, explicit?: string) {
  if (explicit?.trim()) return explicit.trim().slice(0, 3).toUpperCase();
  const words = name.split(/\s+/).filter((w) => w && !SKIP.has(w.toLowerCase()));
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function LogoMark({ initials, size = 40 }: { initials: string; size?: number }) {
  const fs = initials.length > 2 ? 12.5 : 15;
  return (
    <svg className="logo__mark" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="var(--brand, #2478cc)" />
      <path d="M9.5 15.5 20 8l10.5 7.5" fill="none" stroke="var(--brand-hi, #f59e0b)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <text
        x="20"
        y="29.5"
        textAnchor="middle"
        fill="var(--brand-ink, #fff)"
        style={{ font: `800 ${fs}px var(--font-display)`, letterSpacing: "-0.02em" }}
      >
        {initials}
      </text>
    </svg>
  );
}

export default function Logo({
  name,
  initials,
  tagline,
  src,
  size = "md",
}: {
  name: string;
  initials: string;
  tagline?: string;
  /** Designed concept mark (public/assets/logos/<slug>.svg). Falls back to the initials badge. */
  src?: string;
  size?: "md" | "lg";
}) {
  const px = size === "lg" ? 56 : 40;
  return (
    <span className={`logo logo--${size}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="logo__mark logo__mark--img" src={src} width={px} height={px} alt="" />
      ) : (
        <LogoMark initials={initials} size={px} />
      )}
      <span className="logo__text">
        <span className="logo__name">{name}</span>
        {tagline && <span className="logo__tag">{tagline}</span>}
      </span>
    </span>
  );
}

/** Same mark as a data-URI SVG for the browser tab icon. */
export function faviconFor(initials: string, primary = "#2478cc", accent = "#f59e0b", ink = "#ffffff") {
  const fs = initials.length > 2 ? 12.5 : 15;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="${primary}"/><path d="M9.5 15.5 20 8l10.5 7.5" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><text x="20" y="29.5" text-anchor="middle" fill="${ink}" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="${fs}">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
