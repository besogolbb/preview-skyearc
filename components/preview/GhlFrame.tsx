"use client";

import { useEffect, useState } from "react";
import { PREFILL_EVENT, type PrefillDetail } from "./QuickQuoteForm";
import { MockCalendar, MockForm } from "./GhlMock";

/**
 * A GoHighLevel form or calendar iframe. Loads lazily; the form variant
 * accepts prefill from the hero's quick form via GHL's URL-param prefill.
 */
export default function GhlFrame({
  src,
  title,
  kind,
  market,
  jobTypes = [],
  fieldLabel,
}: {
  src: string;
  title: string;
  kind: "form" | "calendar";
  market: "US" | "AU";
  jobTypes?: string[];
  fieldLabel?: string;
}) {
  const [url, setUrl] = useState(src);

  useEffect(() => {
    if (kind !== "form" || !src) return;
    const onPrefill = (e: Event) => {
      const d = (e as CustomEvent<PrefillDetail>).detail;
      const [first, ...rest] = d.name.trim().split(/\s+/);
      const u = new URL(src);
      u.searchParams.set("first_name", first ?? "");
      if (rest.length) u.searchParams.set("last_name", rest.join(" "));
      u.searchParams.set("full_name", d.name.trim());
      u.searchParams.set("phone", d.phone.trim());
      u.searchParams.set(market === "AU" ? "city" : "postal_code", d.postcode.trim());
      setUrl(u.toString());
    };
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, [kind, src, market]);

  // No live embed for this preview yet: a working mockup that sends nothing.
  if (!src) return kind === "form" ? <MockForm market={market} jobTypes={jobTypes} fieldLabel={fieldLabel} /> : <MockCalendar />;

  return (
    <iframe
      src={url}
      title={title}
      loading="lazy"
      scrolling="yes"
      allow="clipboard-write"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
