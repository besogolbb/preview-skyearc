"use client";

import { useEffect, useState } from "react";

/**
 * Footer pages that only exist in the full launch build (Privacy, Terms).
 * They show a short notice instead of linking to a page that 404s.
 */
export default function LaunchLinks({ items }: { items: string[] }) {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 2600);
    return () => clearTimeout(t);
  }, [msg]);

  return (
    <>
      {items.map((label) => (
        <button key={label} type="button" className="footer__soft" onClick={() => setMsg(`${label}: included in full launch build`)}>
          {label}
        </button>
      ))}
      <p className="toast" role="status" data-show={msg ? "" : undefined}>
        {msg}
      </p>
    </>
  );
}
