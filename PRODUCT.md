# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, in this order:

1. **The prospect (primary decision-maker).** The owner of a US or AU residential construction or trade business: remodeler, builder, design-build firm, HVAC, plumbing, electrical or roofing. Usually a small owner-operated firm. SkyeArc sends them a private link to a concept site built around their business. They look at it once, often on a phone between jobs, and decide whether it's worth a call with SkyeArc. They need to see their own business shown better than it is now, and see how leads would actually reach them.
2. **The prospect's future customers (the simulated audience).** Homeowners who need a quote or estimate for work on their home. Each preview is written for these people so the prospect can picture it working: what the company does, where it works, and how to request a quote, book a time, or ask a question.

## Product Purpose

"Digital Dispatch" concept previews: a website for each prospect, built by Skye Arc AI Technologies (skyearc.tech) as a sales tool. Each preview shows the prospect a working lead-capture front end (quote form, booking calendar, AI chat assistant), the same system SkyeArc sells (AI lead capture, construction CRM and process automation, also offered as ARC Business OS).

A preview succeeds when the prospect recognizes their own business in it, understands how inquiries would be captured and followed up, and agrees to talk to SkyeArc. It is not a live site and not a deliverable; it is a pitch the prospect can click through.

## Positioning

SkyeArc's position comes from skyearc.tech, and is self-described with no supporting data: construction-specific, process-first, built and onboarded turnkey ("We Solve Business Problems. We Don't Sell Software."). The previews show this position in practice instead of claiming it. Every page treats the quote, booking and chat path as the center of the site, because that is the system SkyeArc installs.

## Operating Context

- One repo, one preview per prospect. The **subject** of each preview is the prospect's company, not SkyeArc.
- Facts about each prospect (company name, trades and services, service area, contact details, years in business when stated) come from the prospect's public website, Facebook page and directory listings.
- Prospects are in the US or AU. The market sets the wording (see Constraints).
- Previews are shared as private links and must stay out of search indexes.

## Capabilities and Constraints

Binding rules (from the project's `claude.md`):

- `<meta name="robots" content="noindex, nofollow" />` hardcoded in `app/layout.tsx`.
- A sticky top banner on every page: "CONCEPT PREVIEW ONLY — Built by skyeArc AI Technologies for [Company Name]. Not live or publicly indexed."
- **Never use the prospect's copyrighted project photos or logo files.** Use a clean typographic wordmark built from the company name, plus vetted trade stand-in photos, each captioned "Sample project photo — replaced with your real portfolio on launch." Public pages are used only for facts, never for images or logo artwork.
- Never invent testimonials, reviews, guarantees, licenses or awards, and never promise "more leads" or revenue.
- Localization: AU wording uses "quotes" with a casual, direct tone. US wording uses "estimates/quotes" with a direct, blue-collar tone.
- Required embeds on every preview: a GoHighLevel (GHL) quote form iframe, a GHL booking calendar iframe, and the n8n "Skye" chat widget.

Stack already in place: Next.js 16 (App Router, read `node_modules/next/dist/docs/` before writing code, per AGENTS.md), React 19, Tailwind CSS 4, three.js, framer-motion.

Undecided:
- Routing: one route per prospect or one deploy per prospect.
- Embed URLs and IDs for each prospect.
- Where the stand-in photo library comes from (license source).

## Brand Commitments

- Each preview is presented under the prospect's company name, as a typographic wordmark. SkyeArc's name appears in the preview banner, and as builder credit only where the rules call for it.
- The SkyeArc name is written "skyeArc AI Technologies" in the banner (verbatim from the rules). The company's own site uses "Skye Arc AI Technologies."
- Voice follows the market rules above. Copy is plain and practical and speaks to homeowners.

## Evidence on Hand

- In the repo: nothing yet besides the default Next.js starter.
- For each prospect: only facts verified from their public pages. No reviews, ratings, project counts or customer quotes unless the prospect has published them, and even then quote them only as their own, attributed published words.
- SkyeArc itself has no published testimonials, client names, case studies or result stats (checked on skyearc.tech, 2026-11-24). Do not fabricate any.

## Product Principles

1. **Their business, recognizably.** Each preview should read as built for that one company: its trades, its service area, its wording. Not a reskinned template.
2. **The lead path is the product.** Quote, book and chat are the main thing on every screen, and they work.
3. **Honest by construction.** Concept labeling, stand-in photo captions and claims checked against facts are features. They protect both SkyeArc and the prospect.
4. **Seen on a phone.** The first look is usually a link opened on a phone. The first screen has to work there.
5. **Credible to tradespeople.** Clear and sturdy beats clever. Nothing should look like a gimmick to a contractor.

## Accessibility & Inclusion

No product-specific requirement established. Homeowner visitors span all ages. Default to WCAG 2.2 AA, legible type at phone size, and tap targets usable with work gloves off but in a hurry.
