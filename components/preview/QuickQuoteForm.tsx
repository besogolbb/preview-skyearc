"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { ArrowIcon } from "./icons";
import type { Market } from "@/lib/preview-shared";
import { wording } from "@/lib/preview-shared";

type Fields = "name" | "phone" | "postcode" | "jobType";
type Errors = Partial<Record<Fields, string>>;

export const PREFILL_EVENT = "preview:prefill-quote";
export type PrefillDetail = { name: string; phone: string; postcode: string; jobType: string };

/**
 * The 4-field hero form. Posts to /api/quote, which forwards to the GHL
 * inbound webhook. When none is configured (501) it hands the answers to the
 * full GHL form in the booking hub (prefilled via URL params) and scrolls there.
 */
export default function QuickQuoteForm({
  slug,
  market,
  field,
}: {
  slug: string;
  market: Market;
  field: { label: string; options: string[] };
}) {
  const w = wording(market);
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<{ text: string; tone?: "ok" | "err" }>({ text: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const id = (f: string) => `${uid}-${f}`;

  function validate(d: PrefillDetail): Errors {
    const e: Errors = {};
    if (d.name.trim().length < 2) e.name = "Write your name so we know who to ask for.";
    if (d.phone.replace(/\D/g, "").length < 8) e.phone = "Write a phone number with the area code.";
    if (d.postcode.trim().length < 3) e.postcode = market === "AU" ? "Write your suburb or postcode." : "Write your 5-digit ZIP code.";
    if (!d.jobType) e.jobType = `Pick a ${field.label.toLowerCase()}.`;
    return e;
  }

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    if (fd.get("company_website")) return; // honeypot
    const d: PrefillDetail = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      postcode: String(fd.get("postcode") ?? ""),
      jobType: String(fd.get("jobType") ?? ""),
    };
    const e = validate(d);
    setErrors(e);
    const bad = Object.keys(e) as Fields[];
    if (bad.length) {
      setStatus({ text: `${bad.length} ${bad.length === 1 ? "field needs" : "fields need"} a fix.`, tone: "err" });
      formRef.current?.querySelector<HTMLElement>(`[name="${bad[0]}"]`)?.focus();
      return;
    }

    setBusy(true);
    const t = setTimeout(() => setStatus({ text: "Sending…" }), 300);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, ...d }),
      });
      if (res.status === 501) {
        // No webhook for this preview: hand the answers to the full GHL form below.
        window.dispatchEvent(new CustomEvent<PrefillDetail>(PREFILL_EVENT, { detail: d }));
        setStatus({ text: `Your details are in the full ${w.quote} form below. Add the job details and send it.` });
        document.getElementById("hub")?.scrollIntoView({ block: "start" });
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      setSent(true);
      setStatus({ text: `Your ${w.quote} request is in. We'll call you back on the number you gave.`, tone: "ok" });
    } catch {
      setStatus({ text: `That didn't send. Your answers are still here: try again, or call us.`, tone: "err" });
    } finally {
      clearTimeout(t);
      setBusy(false);
    }
  }

  const err = (f: Fields) =>
    errors[f] ? (
      <p className="field__error" id={id(`${f}-err`)}>
        {errors[f]}
      </p>
    ) : null;
  const aria = (f: Fields) => ({
    "aria-invalid": errors[f] ? (true as const) : undefined,
    "aria-describedby": errors[f] ? id(`${f}-err`) : undefined,
  });

  return (
    <form ref={formRef} className="form" noValidate onSubmit={onSubmit} aria-label={`Quick ${w.quote} request`}>
      <div className="field">
        <label htmlFor={id("name")}>Name</label>
        <input id={id("name")} name="name" autoComplete="name" disabled={sent} {...aria("name")} />
        {err("name")}
      </div>
      <div className="form__row">
        <div className="field">
          <label htmlFor={id("phone")}>Phone</label>
          <input id={id("phone")} name="phone" type="tel" autoComplete="tel" inputMode="tel" disabled={sent} {...aria("phone")} />
          {err("phone")}
        </div>
        <div className="field">
          <label htmlFor={id("postcode")}>{w.postcode}</label>
          <input
            id={id("postcode")}
            name="postcode"
            autoComplete={w.postcodeAuto}
            inputMode={market === "US" ? "numeric" : "text"}
            disabled={sent}
            {...aria("postcode")}
          />
          {err("postcode")}
        </div>
      </div>
      <div className="field">
        <label htmlFor={id("jobType")}>{field.label}</label>
        <select id={id("jobType")} name="jobType" defaultValue="" disabled={sent} {...aria("jobType")}>
          <option value="" disabled>
            Choose one
          </option>
          {field.options.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
        {err("jobType")}
      </div>
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" hidden aria-hidden="true" />
      <button type="submit" className="btn btn--primary btn--lg" disabled={busy || sent}>
        {busy ? "Sending…" : w.getQuote}
        <ArrowIcon />
      </button>
      <p className="form__assure">No spam. Instant text/email confirmation.</p>
      <p className="form__status" role="status" data-tone={status.tone}>
        {status.text}
      </p>
    </form>
  );
}
