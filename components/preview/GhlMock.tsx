"use client";

import { useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { PREFILL_EVENT, type PrefillDetail } from "./QuickQuoteForm";
import { ArrowIcon, CheckIcon } from "./icons";
import { wording, type Market } from "@/lib/preview-shared";

/**
 * Stand-ins for the GHL form and calendar, shown while a preview has no real
 * embed URL. They behave like the real thing but send nothing anywhere, and
 * say so. A real ghlFormUrl / ghlCalendarUrl in the JSON replaces them.
 */

function MockTag() {
  return <span className="mock__tag">Preview mockup · live GHL embed connects on launch</span>;
}

export function MockForm({ market, jobTypes, fieldLabel = "Job type" }: { market: Market; jobTypes: string[]; fieldLabel?: string }) {
  const w = wording(market);
  const uid = useId();
  const id = (f: string) => `${uid}-${f}`;
  const [v, setV] = useState({ name: "", phone: "", email: "", postcode: "", jobType: "", details: "" });
  const [files, setFiles] = useState(0);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<PrefillDetail>).detail;
      setV((x) => ({ ...x, name: d.name, phone: d.phone, postcode: d.postcode, jobType: d.jobType }));
    };
    window.addEventListener(PREFILL_EVENT, on);
    return () => window.removeEventListener(PREFILL_EVENT, on);
  }, []);

  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((x) => ({ ...x, [k]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    if (v.name.trim().length < 2 || v.phone.replace(/\D/g, "").length < 8) {
      setErr("Add your name and a phone number so the team can reach you.");
      return;
    }
    setErr("");
    setDone(true);
  }

  if (done) {
    return (
      <div className="mock mock--done" role="status">
        <MockTag />
        <span className="mock__ok"><CheckIcon size={28} /></span>
        <strong>Request received, {v.name.trim().split(/\s+/)[0]}</strong>
        <p>
          On the live site this lands in the CRM pipeline straight away and sends you a text and email confirmation.
          Nothing was sent from this preview.
        </p>
        <button type="button" className="btn btn--outline" onClick={() => setDone(false)}>
          Edit the request
        </button>
      </div>
    );
  }

  return (
    <form className="mock form" onSubmit={submit} noValidate aria-label={`${w.Quote} request form (mockup)`}>
      <MockTag />
      <div className="form__row">
        <div className="field">
          <label htmlFor={id("n")}>Full name</label>
          <input id={id("n")} value={v.name} onChange={set("name")} autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor={id("p")}>Phone</label>
          <input id={id("p")} value={v.phone} onChange={set("phone")} type="tel" autoComplete="tel" inputMode="tel" />
        </div>
      </div>
      <div className="form__row">
        <div className="field">
          <label htmlFor={id("e")}>Email</label>
          <input id={id("e")} value={v.email} onChange={set("email")} type="email" autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor={id("z")}>{w.postcode}</label>
          <input id={id("z")} value={v.postcode} onChange={set("postcode")} autoComplete={w.postcodeAuto} />
        </div>
      </div>
      <div className="field">
        <label htmlFor={id("j")}>{fieldLabel}</label>
        <select id={id("j")} value={v.jobType} onChange={set("jobType")}>
          <option value="" disabled>
            Choose one
          </option>
          {jobTypes.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={id("d")}>Project details</label>
        <textarea
          id={id("d")}
          rows={4}
          value={v.details}
          onChange={set("details")}
          placeholder="Rooms, rough size, timing, anything we should know"
        />
      </div>
      <div className="field">
        <span className="field__label">Photos (optional)</span>
        <label className="mock__drop">
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files?.length ?? 0)} />
          {files ? `${files} photo${files === 1 ? "" : "s"} added` : "Tap to add photos of the space"}
        </label>
      </div>
      {err && <p className="field__error" role="alert">{err}</p>}
      <button type="submit" className="btn btn--primary btn--lg">
        Send {w.quote} request <ArrowIcon />
      </button>
    </form>
  );
}

const SLOTS = ["8:00 am", "9:30 am", "11:00 am", "1:00 pm", "2:30 pm", "4:00 pm"];
const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function MockCalendar() {
  // Built after mount so the server and browser agree on "today".
  const [today, setToday] = useState<Date | null>(null);
  const [offset, setOffset] = useState(0);
  const [day, setDay] = useState<Date | null>(null);
  const [slot, setSlot] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    setToday(t);
  }, []);

  const month = useMemo(() => {
    if (!today) return null;
    const first = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const lead = (first.getDay() + 6) % 7;
    const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= days; d++) cells.push(new Date(first.getFullYear(), first.getMonth(), d));
    return { first, cells };
  }, [today, offset]);

  const open = (d: Date) => !!today && d > today && d.getDay() !== 0;
  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en", o);

  if (done && day) {
    return (
      <div className="mock mock--done" role="status">
        <MockTag />
        <span className="mock__ok"><CheckIcon size={28} /></span>
        <strong>
          {fmt(day, { weekday: "long", month: "long", day: "numeric" })} at {slot}
        </strong>
        <p>
          On the live site this books the visit in the calendar and sends a confirmation with links to reschedule or
          cancel. Nothing was booked from this preview.
        </p>
        <button type="button" className="btn btn--outline" onClick={() => setDone(false)}>
          Pick another time
        </button>
      </div>
    );
  }

  return (
    <div className="mock cal">
      <MockTag />
      <div className="cal__top">
        <strong>{month ? fmt(month.first, { month: "long", year: "numeric" }) : " "}</strong>
        <div className="cal__nav">
          <button type="button" aria-label="Previous month" disabled={offset === 0} onClick={() => setOffset((o) => o - 1)}>
            ‹
          </button>
          <button type="button" aria-label="Next month" disabled={offset >= 2} onClick={() => setOffset((o) => o + 1)}>
            ›
          </button>
        </div>
      </div>
      <div className="cal__grid" role="grid" aria-label="Choose a day">
        {DOW.map((d) => (
          <span key={d} className="cal__dow" aria-hidden="true">
            {d}
          </span>
        ))}
        {month?.cells.map((d, i) =>
          d ? (
            <button
              key={i}
              type="button"
              className="cal__day"
              disabled={!open(d)}
              aria-pressed={day?.getTime() === d.getTime()}
              aria-label={fmt(d, { weekday: "long", month: "long", day: "numeric" })}
              onClick={() => {
                setDay(d);
                setSlot("");
              }}
            >
              {d.getDate()}
            </button>
          ) : (
            <span key={i} />
          )
        )}
      </div>
      <div className="cal__slots">
        <p className="cal__label">
          {day ? `Times on ${fmt(day, { weekday: "short", month: "short", day: "numeric" })}` : "Pick a day to see times"}
        </p>
        {day && (
          <div className="cal__times">
            {SLOTS.map((t) => (
              <button key={t} type="button" className="chip" aria-pressed={slot === t} onClick={() => setSlot(t)}>
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
      <button type="button" className="btn btn--primary btn--lg" disabled={!day || !slot} onClick={() => setDone(true)}>
        {day && slot ? `Book ${slot}` : "Choose a day and time"} <ArrowIcon />
      </button>
    </div>
  );
}
