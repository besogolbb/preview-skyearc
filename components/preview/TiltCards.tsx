"use client";

import { useEffect } from "react";

/**
 * Apple TV-style cards (the skyearc.tech card style): every element with
 * [data-tilt] leans toward the pointer in 3D, lifts slightly, and a soft glare
 * follows the cursor. Mouse/trackpad only; off for touch and reduced motion.
 * Writes CSS variables (--rx, --ry, --gx, --gy) that globals.css turns into
 * the transform and the .tilt-glare highlight.
 */
export default function TiltCards() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches) return;

    const MAX = 7; // degrees
    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-tilt]"));
    const offs: (() => void)[] = [];

    for (const el of cards) {
      if (!el.querySelector(":scope > .tilt-glare")) {
        const glare = document.createElement("span");
        glare.className = "tilt-glare";
        glare.setAttribute("aria-hidden", "true");
        el.appendChild(glare);
      }
      let raf = 0;
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width; // 0..1
        const y = (e.clientY - r.top) / r.height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.setProperty("--ry", `${(x - 0.5) * 2 * MAX}deg`);
          el.style.setProperty("--rx", `${(0.5 - y) * 2 * MAX}deg`);
          el.style.setProperty("--gx", `${x * 100}%`);
          el.style.setProperty("--gy", `${y * 100}%`);
        });
      };
      const enter = () => el.classList.add("is-tilt");
      const leave = () => {
        cancelAnimationFrame(raf);
        el.classList.remove("is-tilt");
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      };
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      offs.push(() => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      });
    }
    return () => offs.forEach((f) => f());
  }, []);

  return null;
}
