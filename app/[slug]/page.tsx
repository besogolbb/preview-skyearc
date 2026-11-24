import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { getPreview, listSlugs, telHref, wording, type Preview } from "@/lib/preview";
import { DEFAULT_PHOTO, NICHES, STAND_IN_LABEL, STOCK, heroSrc, stockSrc, type StockKey, type StockPhoto } from "@/lib/stock";
import { resolvePhoto } from "@/lib/stock-server";
import SafeImg from "@/components/preview/SafeImg";
import BlueprintCanvas from "@/components/preview/BlueprintCanvas";
import QuickQuoteForm from "@/components/preview/QuickQuoteForm";
import GhlFrame from "@/components/preview/GhlFrame";
import MobileBar from "@/components/preview/MobileBar";
import SkyeChat from "@/components/preview/SkyeChat";
import SiteNav from "@/components/preview/SiteNav";
import { NAV_LINKS } from "@/lib/nav";
import LaunchLinks from "@/components/preview/LaunchLinks";
import { HeroItem, HeroPanel, HeroTitle, MotionRoot, Reveal } from "@/components/preview/motion";
import { AlertIcon, ArrowIcon, Stars, TrustIcon } from "@/components/preview/icons";

export async function generateStaticParams() {
  const slugs = await listSlugs();
  // Cache Components needs at least one param at build time.
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPreview(slug);
  if (!p) return { title: "Not found" };
  return {
    title: `${p.company.name}: ${p.company.trade.toLowerCase()} in ${p.company.city} (concept preview)`,
    description: p.hero.subhead,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function PreviewPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const p = await getPreview(slug);
  if (!p) notFound();
  return <PreviewView p={p} />;
}

/** Wraps the first occurrence of `word` in the accent colour. */
function highlight(text: string, word: string): ReactNode {
  const i = word ? text.toLowerCase().indexOf(word.toLowerCase()) : -1;
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <span className="hl">{text.slice(i, i + word.length)}</span>
      {text.slice(i + word.length)}
    </>
  );
}

function PreviewView({ p }: { p: Preview }) {
  const w = wording(p.market);
  const { company } = p;
  const tel = company.phone ? telHref(company.phone, p.market) : undefined;
  const area = company.serviceArea?.length ? company.serviceArea : null;
  const cityShort = company.city.split(",")[0];
  const cta = p.hero.primaryCta ?? w.getQuote;

  // Stand-in photos: each service's own key, else the niche set in order, else
  // the default. resolvePhoto() checks the files exist on disk, so every card
  // always has a real photo (see .claude/skills/build-preview/SKILL.md).
  const niche: StockKey[] = p.assetFolder && p.assetFolder in NICHES ? NICHES[p.assetFolder] : [];
  const services = p.solutions.services.slice(0, 3).map((s, i) => ({
    ...s,
    photo: resolvePhoto(s.photo ?? niche[i] ?? DEFAULT_PHOTO).photo,
  }));
  const heroPhoto: StockPhoto = resolvePhoto(p.hero.photo ?? niche[0] ?? DEFAULT_PHOTO).photo;
  const heroImg = heroSrc(heroPhoto);
  const fallbackPhoto = STOCK[DEFAULT_PHOTO] as StockPhoto;
  const fallbackImg = { ...stockSrc(fallbackPhoto), alt: fallbackPhoto.alt, width: fallbackPhoto.w, height: fallbackPhoto.h };
  const credits = [
    ...new Map([heroPhoto, ...services.map((s) => s.photo), fallbackPhoto].map((ph) => [ph.id, ph])).values(),
  ];

  const g = p.google && p.google.reviewCount > 0 ? p.google : null;
  const eyebrow = p.hero.eyebrow ?? `${company.trade} & reliable service in ${cityShort}`;
  const reviews = (p.realReviews ?? []).filter((r) => r.text?.trim()).slice(0, 3);
  const brandStyle = p.brand?.primary ? ({ "--p-accent": p.brand.primary } as CSSProperties) : undefined;

  return (
    <MotionRoot>
      <div style={brandStyle}>
        {/* Concept banner + sticky navigation */}
        <div className="topbar">
          <p className="concept" role="note">
            CONCEPT PREVIEW ONLY — Built by skyeArc AI Technologies for {company.name}. Not live or publicly indexed.
          </p>
          <SiteNav name={company.name} tel={tel} phone={company.phone} cta={cta} />
        </div>

        <main>
          {/* 1. Home: hero */}
          <section className="hero" id="home" aria-labelledby="hero-h">
            <div className="hero__bg" aria-hidden="true">
              <img
                className="hero__photo"
                src={heroImg.src}
                srcSet={heroImg.srcSet}
                sizes="100vw"
                width={heroPhoto.hero?.w ?? heroPhoto.w}
                height={heroPhoto.hero?.h ?? heroPhoto.h}
                alt=""
                fetchPriority="high"
                decoding="async"
              />
              <div className="hero__shade" />
              <BlueprintCanvas />
            </div>

            <div className="wrap split">
              <div className="hero__copy">
                <HeroItem i={-6}>
                  {g ? (
                    <a className="pill pill--caps" href={g.profileUrl} target="_blank" rel="noopener noreferrer">
                      <Stars rating={g.rating} />
                      <strong>{g.rating.toFixed(1)} Google rating</strong>
                      <span className="pill__sep" aria-hidden="true">·</span>
                      <span>{g.reviewCount} reviews</span>
                    </a>
                  ) : (
                    <p className="pill pill--caps">
                      <span className="pill__dot" aria-hidden="true" />
                      <span>{eyebrow}</span>
                    </p>
                  )}
                </HeroItem>
                <HeroTitle id="hero-h" lines={[highlight(p.hero.headline, cityShort)]} />
                <HeroItem i={0}>
                  <p className="hero__lead">{p.hero.subhead}</p>
                </HeroItem>
                <HeroItem i={1} className="hero__actions">
                  <a className="btn btn--primary btn--lg" href="#get-quote">
                    {cta}
                    <ArrowIcon />
                  </a>
                  <a className="btn btn--ghost btn--lg" href="#process">
                    {p.hero.secondaryCta ?? "See how it works"}
                  </a>
                </HeroItem>
                <HeroItem i={2}>
                  <p className="trustline">
                    {p.hero.trustLine.slice(0, 3).map((t, i) => (
                      <span key={t}>
                        {i > 0 && (
                          <span className="trustline__dot" aria-hidden="true">
                            •
                          </span>
                        )}
                        {t}
                      </span>
                    ))}
                  </p>
                </HeroItem>
              </div>

              <HeroPanel>
                <div className="qcard" id="get-quote">
                  <span className="qcard__bar" aria-hidden="true" />
                  <p className="qcard__live">
                    <span className="pulse" aria-hidden="true" />
                    Fast {w.Quote} Request — Instant Reply
                  </p>
                  <p className="qcard__title">Tell us about the job</p>
                  <p className="qcard__sub">Four quick details to start your {w.quote}.</p>
                  <QuickQuoteForm slug={p.slug} market={p.market} field={p.quoteField} />
                </div>
              </HeroPanel>
            </div>
            <p className="hero__standin">{STAND_IN_LABEL}</p>
          </section>

          {/* 2. Home: who we help (nav "About Us" scrolls here) */}
          <section className="section section--white" id="about" aria-labelledby="about-h">
            <div className="wrap">
              <div className="split split--top">
                <Reveal className="section__head section__head--flush">
                  <p className="kicker">Who we help</p>
                  <h2 id="about-h">{p.about.headline}</h2>
                </Reveal>
                <Reveal delay={0.06}>
                  <p className="lead-body">{p.about.body}</p>
                </Reveal>
              </div>
              <div className="cards3">
                {p.about.cards.slice(0, 3).map((c, i) => (
                  <Reveal key={c.title} delay={i * 0.06} className="who">
                    <span className="who__bar" aria-hidden="true" />
                    <h3>{c.title}</h3>
                    <p>{c.body}</p>
                  </Reveal>
                ))}
              </div>
              <Reveal className="closing">
                <p>{p.about.closing}</p>
                <a className="textlink" href="#contact">
                  Get in touch <ArrowIcon />
                </a>
              </Reveal>
            </div>
          </section>

          {/* 3. Problems & solutions */}
          <section id="services" aria-labelledby="problems-h">
            <div className="section section--slate">
              <div className="wrap">
                <Reveal className="section__head">
                  <p className="kicker">The problem</p>
                  <h2 id="problems-h">{p.problems.headline}</h2>
                </Reveal>
                <ul className="pains">
                  {p.problems.points.slice(0, 4).map((pt, i) => (
                    <li key={pt.title}>
                      <Reveal delay={i * 0.05} className="pain">
                        <span className="pain__icon">
                          <AlertIcon />
                        </span>
                        <div>
                          <h3>{pt.title}</h3>
                          <p>{pt.body}</p>
                        </div>
                      </Reveal>
                    </li>
                  ))}
                </ul>
                <Reveal>
                  <p className="bridge">{p.problems.bridge}</p>
                </Reveal>
              </div>
            </div>

            <div className="section section--white">
              <div className="wrap">
                <Reveal className="section__head">
                  <p className="kicker">Services in {cityShort}</p>
                  <h2 id="solutions-h">{p.solutions.headline}</h2>
                  {p.solutions.intro && <p className="measure">{p.solutions.intro}</p>}
                </Reveal>
                <div className="services" style={{ "--cols": 3 } as CSSProperties}>
                  {services.map((s, i) => {
                    const img = stockSrc(s.photo);
                    return (
                      <Reveal key={s.title} delay={i * 0.05} className="card">
                        <div className="card__media">
                          <SafeImg
                            photo={{ ...img, alt: s.photo.alt, width: s.photo.w, height: s.photo.h }}
                            fallback={fallbackImg}
                            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 420px"
                            loading="eager"
                          />
                          <span className="standin">{STAND_IN_LABEL}</span>
                        </div>
                        <div className="card__body">
                          <span className="card__num">{String(i + 1).padStart(2, "0")}</span>
                          <h3>{s.title}</h3>
                          <p>{s.body}</p>
                          <a className="card__cta" href="#contact">
                            {w.requestQuote.replace(/^Request an? /, "Request ")} <span aria-hidden="true">→</span>
                          </a>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* 4. Process & the difference */}
          <section className="section section--slate" id="process" aria-labelledby="process-h">
            <div className="wrap">
              <Reveal className="section__head">
                <p className="kicker">How it works</p>
                <h2 id="process-h">{p.process.headline}</h2>
              </Reveal>
              <ol className="steps steps--4">
                {p.process.steps.slice(0, 4).map((s, i) => (
                  <li key={s.title} className="step">
                    <span className="step__num" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Reveal delay={i * 0.07} className="step__card">
                      <h3>{s.title}</h3>
                      <p>{s.body}</p>
                    </Reveal>
                  </li>
                ))}
              </ol>

              <div className="why">
                <Reveal className="section__head">
                  <p className="kicker">Why {company.name}</p>
                  <h2 id="why-h">{p.why.headline}</h2>
                </Reveal>
                <ul className="themes">
                  {p.why.themes.slice(0, 4).map((t, i) => (
                    <li key={t.title}>
                      <Reveal delay={i * 0.05} className="theme">
                        <span className="trust__icon">
                          <TrustIcon text={`${t.title} ${t.body}`} />
                        </span>
                        <h3>{t.title}</h3>
                        <p>{t.body}</p>
                      </Reveal>
                    </li>
                  ))}
                </ul>

                {reviews.length > 0 && (
                  <div className="why__reviews">
                    <Reveal className="bridge__head">
                      <h3 className="why__sub">What homeowners say on Google</h3>
                      {g && (
                        <a className="bridge__score" href={g.profileUrl} target="_blank" rel="noopener noreferrer">
                          <Stars rating={g.rating} />
                          <strong>{g.rating.toFixed(1)}</strong>
                          <span>from {g.reviewCount} Google reviews</span>
                        </a>
                      )}
                    </Reveal>
                    <div className="reviews">
                      {reviews.map((r, i) => (
                        <Reveal key={`${r.author}-${i}`} delay={i * 0.05}>
                          <figure className="review">
                            <span role="img" aria-label={`${r.rating} out of 5 stars`}>
                              <Stars rating={r.rating} />
                            </span>
                            <blockquote>“{r.text}”</blockquote>
                            <figcaption>
                              <strong>{r.author}</strong>
                              {r.date ? ` · ${r.date}` : ""} · Google
                            </figcaption>
                          </figure>
                        </Reveal>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 5. Final CTA + contact hub */}
          <section className="section section--navy" id="contact" aria-labelledby="contact-h">
            <div className="wrap">
              <Reveal className="final">
                <p className="kicker">Contact us</p>
                <h2 id="contact-h">{p.finalCta.headline}</h2>
                <p className="final__body">{p.finalCta.body}</p>
                <div className="final__actions">
                  <a className="btn btn--primary btn--lg" href="#hub">
                    {p.finalCta.cta ?? cta} <ArrowIcon />
                  </a>
                  {tel && (
                    <a className="btn btn--ghost btn--lg" href={tel}>
                      Call {company.phone}
                    </a>
                  )}
                </div>
                <p className="final__micro">{p.finalCta.microcopy}</p>
              </Reveal>
              <div className="hub" id="hub">
                <Reveal className="hub__pane">
                  <div className="hub__head">
                    <h3>{w.Quote} request</h3>
                    <p>Describe the job and add photos if you have them.</p>
                  </div>
                  <div className="hub__frame">
                    <GhlFrame
                      src={p.embeds.ghlFormUrl}
                      title={`${w.Quote} request form`}
                      kind="form"
                      market={p.market}
                      jobTypes={p.quoteField.options}
                      fieldLabel={p.quoteField.label}
                    />
                  </div>
                </Reveal>
                <Reveal className="hub__pane" delay={0.08}>
                  <div className="hub__head">
                    <h3>Book a time</h3>
                    <p>Choose a day and time for a site visit or a call.</p>
                  </div>
                  <div className="hub__frame">
                    <GhlFrame src={p.embeds.ghlCalendarUrl} title="Booking calendar" kind="calendar" market={p.market} />
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* 6. FAQ */}
          <section className="section section--white" id="faq" aria-labelledby="faq-h">
            <div className="wrap split split--top">
              <Reveal className="section__head section__head--flush">
                <p className="kicker">FAQ</p>
                <h2 id="faq-h">Questions homeowners ask</h2>
                <p className="measure">
                  Something else on your mind?{" "}
                  <a className="link" href="#contact">
                    Ask us directly
                  </a>
                  .
                </p>
              </Reveal>
              <div className="faq">
                {p.faq.slice(0, 5).map((f, i) => (
                  <details key={f.q} className="faq__item" open={i === 0}>
                    <summary>
                      <span>{f.q}</span>
                      <span className="faq__icon" aria-hidden="true" />
                    </summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="wrap">
            <div className="footer__top split">
              <div>
                <p className="footer__name">{company.name}</p>
                <nav className="footer__nav" aria-label="Footer">
                  {NAV_LINKS.map((l) => (
                    <a key={l.href} href={l.href}>
                      {l.label}
                    </a>
                  ))}
                </nav>
              </div>
              <div className="footer__meta">
                <span>{company.trade}</span>
                {area && <span>Serving {listJoin(area)}</span>}
                {tel && (
                  <a href={tel} className="link">
                    {company.phone}
                  </a>
                )}
              </div>
            </div>
            <div className="footer__legal">
              <span>Concept preview built by skyeArc AI Technologies. Not a live website.</span>
              <div className="footer__soft-row">
                <LaunchLinks items={["Privacy Policy", "Terms"]} />
                {credits.length > 0 && (
                  <details className="credits">
                    <summary>Sample photographs via Wikimedia Commons</summary>
                    <ul>
                      {credits.map((ph) => (
                        <li key={ph.id}>
                          <a href={ph.page} target="_blank" rel="noopener noreferrer">
                            {ph.by}
                          </a>
                          ,{" "}
                          <a href={ph.licenceUrl} target="_blank" rel="noopener noreferrer">
                            {ph.licence}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          </div>
        </footer>

        <SkyeChat slug={p.slug} company={company.name} quoteWord={w.quote} tel={tel} greeting={p.skyeGreeting} />
        <MobileBar tel={tel} quoteLabel={cta} />
      </div>
    </MotionRoot>
  );
}

function listJoin(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
