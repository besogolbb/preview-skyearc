"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon, PhoneIcon } from "./icons";
import { NAV_LINKS } from "@/lib/nav";
import Logo from "./Logo";


/**
 * Header: wordmark, centred anchor links, phone + primary CTA.
 * Below 1024px the links move into a drawer behind a menu button.
 */
export default function SiteNav({
  name,
  initials,
  tagline,
  logoSrc,
  tel,
  phone,
  cta,
}: {
  name: string;
  initials: string;
  tagline?: string;
  logoSrc?: string;
  tel?: string;
  phone?: string;
  cta: string;
}) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(true);
  const btn = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);

  // Clear over the hero at the top of the page, frosted solid once scrolled.
  useEffect(() => {
    const on = () => setTop(window.scrollY < 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    drawer.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    const onWide = () => window.innerWidth >= 1024 && setOpen(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onWide);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onWide);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="nav" data-top={top && !open ? "" : undefined}>
      <div className="wrap nav__row">
        <a className="skip-link" href="#home">
          Skip to content
        </a>
        <a className="wordmark" href="#home" aria-label={`${name}, back to top`}>
          <Logo name={name} initials={initials} tagline={tagline} src={logoSrc} />
        </a>

        <nav className="nav__links" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          {tel && (
            <a className="nav__call" href={tel} aria-label={`Call ${name} on ${phone}`}>
              <PhoneIcon />
              <span className="nav__call-text">{phone}</span>
            </a>
          )}
          <a className="btn btn--primary nav__cta" href="#contact">
            {cta}
          </a>
          <button
            ref={btn}
            type="button"
            className="nav__menu"
            aria-expanded={open}
            aria-controls="nav-drawer"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <CloseIcon size={22} /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <div
        ref={drawer}
        id="nav-drawer"
        className="drawer"
        data-open={open || undefined}
        inert={!open || undefined}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        <nav aria-label="Main (menu)">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="drawer__link">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="drawer__actions">
          <a className="btn btn--primary btn--lg" href="#contact">
            {cta}
          </a>
          {tel && (
            <a className="btn btn--ghost btn--lg" href={tel}>
              <PhoneIcon /> Call {phone}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
