type P = { size?: number; className?: string };

export function PhoneIcon({ size = 18, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M6.6 3.5h2.6l1.4 4-1.9 1.3a11.6 11.6 0 0 0 6.5 6.5l1.3-1.9 4 1.4v2.6a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowIcon({ size = 16, className = "arrow" }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M2.5 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChatIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V17h0A1.5 1.5 0 0 1 4 15.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M8.5 10.5h7M8.5 13.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SendIcon({ size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="stars" aria-hidden="true">
      {"★★★★★".slice(0, full)}
      <span style={{ opacity: 0.25 }}>{"★★★★★".slice(full)}</span>
    </span>
  );
}

export function GoogleG({ size = 20 }: P) {
  // Google "G" in its own colours (real mark, not redrawn in brand colours).
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5Z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A11.9 11.9 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44Z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5Z" />
    </svg>
  );
}

const stroke = { stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

export function DocIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" {...stroke} />
      <path d="M13.5 3.5V8H18M8.5 12.5h7M8.5 16h4.5" {...stroke} />
    </svg>
  );
}
export function HardhatIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 17.5h17M5 17.5V15a7 7 0 0 1 14 0v2.5M10 8.4V6h4v2.4M12 6v5" {...stroke} />
    </svg>
  );
}
export function CalendarIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" {...stroke} />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M9 14.5l2 2 4-4" {...stroke} />
    </svg>
  );
}
export function BoltIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 3.5 5.5 13.5H12l-1 7 7.5-10H12l1-7Z" {...stroke} />
    </svg>
  );
}
export function ShieldIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5 19 6v5.5c0 4.3-3 7.7-7 9-4-1.3-7-4.7-7-9V6l7-2.5Z" {...stroke} />
      <path d="m9 12 2 2 4-4" {...stroke} />
    </svg>
  );
}
export function CheckIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" {...stroke} />
      <path d="m8.5 12 2.5 2.5 4.5-5" {...stroke} />
    </svg>
  );
}

/** Picks a trust-bar icon from the wording of the point. */
export function TrustIcon({ text }: { text: string }) {
  const t = text.toLowerCase();
  if (/licen|insur|bond|certif/.test(t)) return <ShieldIcon />;
  if (/quote|estimate|written|price/.test(t)) return <DocIcon />;
  if (/lead|team|crew|project manager|supervisor/.test(t)) return <HardhatIcon />;
  if (/book|visit|calendar|schedule|time/.test(t)) return <CalendarIcon />;
  if (/instant|confirm|reply|text|sms|email/.test(t)) return <BoltIcon />;
  return <CheckIcon />;
}

export function AlertIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" {...stroke} />
      <path d="M12 7.5v5.5M12 16.2v.3" {...stroke} />
    </svg>
  );
}
