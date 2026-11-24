import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { getPreview, listSlugs, telHref, wording, type Preview } from "@/lib/preview";
import { DEFAULT_PHOTO, NICHES, STAND_IN_LABEL, STOCK, heroSrc, stockSrc, type StockKey, type StockPhoto } from "@/lib/stock";
import { resolveLogo, resolvePhoto } from "@/lib/stock-server";
import SafeImg from "@/components/preview/SafeImg";
import Logo, { faviconFor, initialsFor } from "@/components/preview/Logo";
import BlueprintCanvas from "@/components/preview/BlueprintCanvas";
import QuickQuoteForm from "@/components/preview/QuickQuoteForm";
import GhlFrame from "@/components/preview/GhlFrame";
import MobileBar from "@/components/preview/MobileBar";
import SkyeChat from "@/components/preview/SkyeChat";
import SiteNav from "@/components/preview/SiteNav";
import { NAV_LINKS } from "@/lib/nav";
import LaunchLinks from "@/components/preview/LaunchLinks";
import TiltCards from "@/components/preview/TiltCards";
import { HeroItem, HeroPanel, HeroTitle, MotionRoot, Reveal } from "@/components/preview/motion";
import { AlertIcon, ArrowIcon, PhoneIcon, Stars, TrustIcon } from "@/components/preview/icons";

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
    icons: {
      icon: resolveLogo(p.logo?.svg) ?? faviconFor(initialsFor(p.company.name, p.logo?.initials), p.brand?.primary, p.brand?.accent, p.brand?.primaryInk),
    },
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
      <span className="arc-u">
        {text.slice(i, i + word.length)}
        <svg className="arc-u-svg" viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path pathLength={1} d="M3 15C70 19 150 11 197 3" />
        </svg>
      </span>
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
  // Concept logo (original typographic mark, never the prospect's own logo file).
  const initials = initialsFor(company.name, p.logo?.initials);
  const logoTag = p.logo?.tagline ?? `${company.trade} · ${cityShort}`;
  const logoSrc = resolveLogo(p.logo?.svg);

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
  // Client colours only (style is skyearc's). Unset values fall back to the CSS defaults.
  const brandStyle = {
    ...(p.brand?.primary && { "--brand": p.brand.primary }),
    ...(p.brand?.dark && { "--brand-dark": p.brand.dark }),
    ...(p.brand?.accent && { "--brand-hi": p.brand.accent }),
    ...(p.brand?.primaryInk && { "--brand-ink": p.brand.primaryInk }),
  } as CSSProperties;
  // Bento lead photo: a service photo that isn't the hero's (prefer the last), so
  // the same picture never fills both the hero and the problem tile.
  const bentoPhoto: StockPhoto =
    [...services].reverse().find((s) => s.photo.id !== heroPhoto.id)?.photo ?? services[0].photo;

  return (
    <MotionRoot>
      <div style={brandStyle}>
        {/* Concept banner + sticky navigation (transparent over the hero, frosted white on scroll) */}
        <div className="topbar">
          <p className="concept" role="note">
            CONCEPT PREVIEW ONLY — Built by skyeArc AI Technologies for {company.name}. Not live or publicly indexed.
          </p>
          <SiteNav name={company.name} initials={initials} tagline={logoTag} logoSrc={logoSrc} tel={tel} phone={company.phone} cta={cta} />
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
              <BlueprintCanvas color={p.brand?.primary ?? "#2478cc"} />
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
                    <p className="kicker kicker--light">{eyebrow}</p>
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
                  <a className="sbtn" href="#process">
                    <span>{p.hero.secondaryCta ?? "See how it works"}</span>
                    <i aria-hidden="true">
                      <ArrowIcon />
                    </i>
                  </a>
                </HeroItem>
                <HeroItem i={2}>
                  <ul className="hero-proof" aria-label="Why homeowners choose us">
                    {p.hero.trustLine.slice(0, 3).map((t) => (
                      <li key={t}>
                        <CheckMini />
                        {t}
                      </li>
                    ))}
                  </ul>
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
            <div className="arc-rise" aria-hidden="true">
              <svg viewBox="0 0 1440 120" preserveAspectRatio="none" focusable="false">
                <path d="M0 120V96C480 120 1080 60 1440 0V120Z" />
              </svg>
            </div>
          </section>

          {/* 2. Home: who we help (nav "About Us" scrolls here) */}
          <section className="sec sec--white" id="about" aria-labelledby="about-h">
            <div className="wrap">
              <div className="head head--split">
                <Reveal>
                  <p className="kicker">Who we help</p>
                  <h2 id="about-h">{p.about.headline}</h2>
                </Reveal>
                <Reveal delay={0.06}>
                  <p className="head__sub">{p.about.body}</p>
                </Reveal>
              </div>
              <ul className="who-grid">
                {p.about.cards.slice(0, 3).map((c, i) => (
                  <li key={c.title}>
                    <Reveal delay={i * 0.06} className="tilt-wrap">
                      <div className="who-card" data-tilt>
                        <span className="who-card__n" aria-hidden="true">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3>{c.title}</h3>
                        <p>{c.body}</p>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
              <Reveal className="closing">
                <p>{p.about.closing}</p>
                <a className="tlink" href="#contact">
                  Get in touch <ArrowIcon />
                </a>
              </Reveal>
            </div>
          </section>

          {/* 3. Problems (bento) & solutions (navy rows) */}
          <section id="services" aria-labelledby="problems-h">
            <div className="sec sec--mist">
              <div className="wrap">
                <ul className="bento">
                  <li className="bt bt-lead" data-tilt>
                    <SafeImg
                      photo={{ ...stockSrc(bentoPhoto), alt: bentoPhoto.alt, width: bentoPhoto.w, height: bentoPhoto.h }}
                      fallback={fallbackImg}
                      sizes="(max-width: 1199px) 100vw, 820px"
                    />
                    <span className="standin">{STAND_IN_LABEL}</span>
                    <div className="bt-lead-copy">
                      <p className="kicker kicker--light">The problem</p>
                      <h2 id="problems-h">{p.problems.headline}</h2>
                    </div>
                  </li>
                  {p.problems.points.slice(0, 4).map((pt, i) => (
                    <li key={pt.title} className={`bt bt-${"abcd"[i]}`} data-tilt>
                      <span className="bt-ic" aria-hidden="true">
                        <AlertIcon />
                      </span>
                      <h3>{pt.title}</h3>
                      <p>{pt.body}</p>
                    </li>
                  ))}
                </ul>
                <Reveal>
                  <p className="bento-note">{p.problems.bridge}</p>
                </Reveal>
              </div>
            </div>

            <div className="sec sec--navy sec-rows">
              <div className="wrap">
                <Reveal className="head head--light">
                  <p className="kicker kicker--light">Services in {cityShort}</p>
                  <h2 id="solutions-h">{p.solutions.headline}</h2>
                  {p.solutions.intro && <p className="head__sub">{p.solutions.intro}</p>}
                </Reveal>
                {services.map((s, i) => {
                  const img = stockSrc(s.photo);
                  return (
                    <article key={s.title} className="srow">
                      <Reveal className="srow-txt">
                        <span className="srow-n">{String(i + 1).padStart(2, "0")}</span>
                        <h3>{s.title}</h3>
                        <p>{s.body}</p>
                        <a className="sbtn" href="#contact">
                          <span>{w.requestQuote}</span>
                          <i aria-hidden="true">
                            <ArrowIcon />
                          </i>
                        </a>
                      </Reveal>
                      <Reveal delay={0.08} className="tilt-wrap">
                        <div className="srow-shot" data-tilt>
                        <SafeImg
                          photo={{ ...img, alt: s.photo.alt, width: s.photo.w, height: s.photo.h }}
                          fallback={fallbackImg}
                          sizes="(max-width: 1023px) 100vw, 640px"
                          loading="eager"
                        />
                        <span className="standin">{STAND_IN_LABEL}</span>
                        </div>
                      </Reveal>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 4. Process & the difference */}
          <section className="sec sec--white" id="process" aria-labelledby="process-h">
            <div className="wrap">
              <div className="head head--split">
                <Reveal>
                  <p className="kicker">How it works</p>
                  <h2 id="process-h">{p.process.headline}</h2>
                </Reveal>
              </div>
              <ol className="arc2">
                {p.process.steps.slice(0, 4).map((s, i) => (
                  <li key={s.title}>
                    <Reveal delay={i * 0.07}>
                      <span className="arc2-L" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3>{s.title}</h3>
                      <p>{s.body}</p>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="sec sec--mist" id="why" aria-labelledby="why-h">
            <div className="wrap">
              <div className="why">
                <Reveal className="why-l">
                  <p className="kicker">Why {company.name}</p>
                  <h2 id="why-h">{p.why.headline}</h2>
                  <a className="tlink" href="#contact">
                    {w.requestQuote} <ArrowIcon />
                  </a>
                </Reveal>
                <ul className="why-list">
                  {p.why.themes.slice(0, 4).map((t, i) => (
                    <li key={t.title}>
                      <Reveal delay={i * 0.05} className="why-item">
                        <span className="why-ic" aria-hidden="true">
                          <TrustIcon text={`${t.title} ${t.body}`} />
                        </span>
                        <div>
                          <h3>{t.title}</h3>
                          <p>{t.body}</p>
                        </div>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>

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
                        <figure className="review" data-tilt>
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
          </section>

          {/* 5. Final CTA + contact hub */}
          <section className="sec sec--navy sec-contact" id="contact" aria-labelledby="contact-h">
            <div className="wrap">
              <Reveal className="final">
                <p className="kicker kicker--light">Contact us</p>
                <h2 id="contact-h">{p.finalCta.headline}</h2>
                <p className="final__body">{p.finalCta.body}</p>
                <div className="final__actions">
                  <a className="btn btn--primary btn--lg" href="#hub">
                    {p.finalCta.cta ?? cta} <ArrowIcon />
                  </a>
                  {tel && (
                    <a className="sbtn" href={tel}>
                      <span>Call {company.phone}</span>
                      <i aria-hidden="true">
                        <PhoneIcon />
                      </i>
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
          <section className="sec sec--white" id="faq" aria-labelledby="faq-h">
            <div className="wrap faq-wrap">
              <Reveal className="faq-l">
                <p className="kicker">FAQ</p>
                <h2 id="faq-h">Questions homeowners ask</h2>
                <a className="tlink" href="#contact">
                  Ask us directly <ArrowIcon />
                </a>
              </Reveal>
              <div className="faq-list">
                {p.faq.slice(0, 5).map((f, i) => (
                  <details key={f.q} open={i === 0}>
                    <summary>
                      <span>{f.q}</span>
                      <PlusIcon />
                    </summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className="ftr">
          <div className="wrap">
            <div className="ftr-grid">
              <div className="ftr-brand">
                <Logo name={company.name} initials={initials} tagline={logoTag} src={logoSrc} size="lg" />
                <p>{p.hero.subhead.split(". ")[0]}.</p>
              </div>
              <div>
                <h3>Explore</h3>
                <ul>
                  {NAV_LINKS.map((l) => (
                    <li key={l.href}>
                      <a href={l.href}>{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Services</h3>
                <ul>
                  {services.map((s) => (
                    <li key={s.title}>
                      <a href="#services">{s.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Contact</h3>
                {area && <p>Serving {listJoin(area)}</p>}
                {tel && (
                  <p>
                    <a className="ftr-tel" href={tel}>
                      {company.phone}
                    </a>
                  </p>
                )}
                <a className="btn btn--primary" href="#contact">
                  {cta}
                </a>
              </div>
            </div>
            <div className="ftr-base">
              <span>Concept preview built by skyeArc AI Technologies. Not a live website. Logo shown is a concept mark.</span>
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

        <TiltCards />
        <SkyeChat slug={p.slug} company={company.name} quoteWord={w.quote} tel={tel} greeting={p.skyeGreeting} />
        <MobileBar tel={tel} quoteLabel={cta} />
      </div>
    </MotionRoot>
  );
}

function CheckMini() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="m8 12.5 2.6 2.6L16 9.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function listJoin(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
