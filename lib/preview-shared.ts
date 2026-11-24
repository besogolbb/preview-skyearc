import type { NicheKey, StockKey } from "./stock";

/**
 * One prospect = one JSON file in data/previews/<slug>.json, one homepage.
 * Facts (name, phone, areas, services, rating, reviews, credentials) must come
 * from the prospect's own public pages or Google Business Profile. Never invent
 * ratings, reviews, years in business, licences or guarantees (see claude.md).
 * Copy fields (headlines, pain points, FAQ) are written for the prospect, in
 * the market's wording, without promising leads, revenue or guarantees.
 */
export type Market = "US" | "AU";

export type Card = { title: string; body: string };

export type Service = Card & {
  /** Key into the vetted stand-in library (lib/stock.ts). Never the prospect's own photos. */
  photo?: StockKey;
};

export type Review = {
  author: string;
  /** 1-5, as shown on Google */
  rating: number;
  /** Verbatim text copied from the Google review. Do not edit or shorten. */
  text: string;
  /** As Google shows it, e.g. "3 months ago". Optional. */
  date?: string;
};

export type Faq = { q: string; a: string };

export type Preview = {
  slug: string;
  market: Market;
  company: {
    name: string;
    /** The trade as a noun phrase, e.g. "Kitchen and bathroom remodeling" */
    trade: string;
    /** Main city/suburb, e.g. "Plano, TX" or "Perth, WA" */
    city: string;
    /** Areas served, as the prospect lists them */
    serviceArea?: string[];
    /** Published phone number, as written on their listing */
    phone?: string;
    /** Only if published, e.g. "Licensed & Insured" or "Lic. 123456" */
    credential?: string;
  };
  /** Concept logo: original typographic mark. Never the prospect's logo file. */
  logo?: {
    /** 1-3 letters; default = first letters of the first two words */
    initials?: string;
    /** Short line under the name; default "<trade> · <city>" */
    tagline?: string;
    /** Designed concept mark from the logo-design skill: "/assets/logos/<slug>.svg" (client colours baked in) */
    svg?: string;
  };
  /**
   * Client brand colours (from their own site, van, signage or Google photos).
   * The page STYLE follows skyearc.tech; the COLOURS always come from here.
   * Defaults when unknown: primary #2478CC, dark #13243A, accent #F59E0B.
   */
  brand?: {
    /** Buttons, links, logo badge */
    primary?: string;
    /** Hero, dark sections, footer */
    dark?: string;
    /** Highlights on dark: headline underline, icons, numerals */
    accent?: string;
    /** Text colour on primary buttons; set "#0b1626" when primary is light (yellow, lime) */
    primaryInk?: string;
  };
  /** Real Google Business Profile numbers. null when unknown. */
  google?: { rating: number; reviewCount: number; profileUrl: string } | null;
  /** Stand-in photo set for the trade (lib/stock.ts NICHES). */
  assetFolder?: NicheKey;

  hero: {
    /** Short uppercase pill. Ignored when a real Google rating is present. */
    eyebrow?: string;
    headline: string;
    /** Two sentences for local homeowners. */
    subhead: string;
    /** Defaults to "Get a quote" / "Get an estimate". Only say "free" if the contractor does. */
    primaryCta?: string;
    /** Defaults to "See how it works". */
    secondaryCta?: string;
    /** Three short proof points, shown separated by • */
    trustLine: string[];
    /** Stand-in photo behind the hero. Defaults to the first service photo. */
    photo?: StockKey;
  };
  /** The quick form's 4th field, by sub-niche (Project type, Roof need, Urgency…). */
  quoteField: { label: string; options: string[] };
  /** First message from the chat widget. Never say "Skye": the chat speaks as the client. */
  skyeGreeting?: string;
  /** Name on the floating chat ("Ask Moxey"). Default = first word of the company name. */
  assistantName?: string;

  about: { headline: string; body: string; cards: Card[]; closing: string };
  problems: { headline: string; points: Card[]; bridge: string };
  solutions: { headline: string; intro?: string; services: Service[] };
  process: { headline: string; steps: Card[] };
  why: { headline: string; themes: Card[] };
  /** Verbatim public Google reviews only. Empty hides the block. */
  realReviews: Review[];
  finalCta: { headline: string; body: string; cta?: string; microcopy: string };
  faq: Faq[];

  /** Research notes, never rendered: the lead-capture gap found, sources. */
  gap?: string;
  _sources?: Record<string, string>;

  embeds: {
    /** GHL form embed URL, e.g. https://api.leadconnectorhq.com/widget/form/<id>. Empty shows the mockup. */
    ghlFormUrl: string;
    /** GHL calendar embed URL, e.g. https://api.leadconnectorhq.com/widget/booking/<id>. Empty shows the mockup. */
    ghlCalendarUrl: string;
    /** n8n Chat Trigger webhook for "Skye". Falls back to env SKYE_CHAT_WEBHOOK_URL. */
    skyeWebhookUrl?: string;
    /** GHL inbound webhook for the hero quick form. Falls back to env GHL_QUICK_QUOTE_WEBHOOK_URL. */
    quickQuoteWebhookUrl?: string;
  };
};

/** Market wording: AU says "quote", US says "estimate" (claude.md). */
export function wording(market: Market) {
  const au = market === "AU";
  return {
    quote: au ? "quote" : "estimate",
    Quote: au ? "Quote" : "Estimate",
    getQuote: au ? "Get a quote" : "Get an estimate",
    requestQuote: au ? "Request a quote" : "Request an estimate",
    postcode: au ? "Suburb or postcode" : "ZIP code",
    postcodeAuto: au ? "address-level2" : "postal-code",
    callNow: "Call now",
  };
}

export function telHref(phone: string, market: Market) {
  let digits = phone.replace(/[^\d+]/g, "");
  if (!digits.startsWith("+")) {
    if (market === "AU" && digits.startsWith("0")) digits = "+61" + digits.slice(1);
    else if (market === "US" && digits.length === 10) digits = "+1" + digits;
  }
  return `tel:${digits}`;
}
