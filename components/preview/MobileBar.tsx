"use client";

import { useEffect, useState } from "react";
import { PhoneIcon } from "./icons";

/**
 * Phone-only sticky bottom bar: Call now + Get a quote/estimate.
 * Hidden while the hero is on screen (the hero form is the action there)
 * and while the quote hub is on screen (it already shows the action).
 */
export default function MobileBar({ tel, quoteLabel }: { tel?: string; quoteLabel: string }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const hero = document.getElementById("home");
    const hub = document.getElementById("contact");
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target, e.isIntersecting);
        setHidden([...seen.values()].some(Boolean));
      },
      { threshold: 0.1 },
    );
    if (hero) io.observe(hero);
    if (hub) io.observe(hub);
    return () => io.disconnect();
  }, []);

  return (
    <nav className="actionbar" aria-label="Quick actions" data-hidden={hidden} inert={hidden || undefined}>
      {tel && (
        <a className="btn btn--secondary" href={tel}>
          <PhoneIcon size={18} />
          Call now
        </a>
      )}
      <a className="btn btn--primary" href="#contact">
        {quoteLabel}
      </a>
    </nav>
  );
}
