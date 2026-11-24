"use client";

import { MotionConfig, motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const EASE_ENTER = [0.22, 1, 0.36, 1] as const;

/** Respects prefers-reduced-motion for every framer-motion child. */
export function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Hero h1: each line rises out of its own mask, once, on load. */
export function HeroTitle({ lines, id }: { lines: ReactNode[]; id: string }) {
  return (
    <h1 id={id}>
      {lines.map((line, i) => (
        <span className="line" key={i}>
          <motion.span
            data-reveal=""
            initial={{ y: "105%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.7, delay: 0.05 + i * 0.08, ease: EASE_ENTER }}
          >
            {line}
          </motion.span>
          {i < lines.length - 1 ? " " : null}
        </span>
      ))}
    </h1>
  );
}

/** Hero items after the h1: fade up 12px, 60ms apart, starting as the title lands. */
export function HeroItem({ children, i = 0, className }: { children: ReactNode; i?: number; className?: string }) {
  return (
    <motion.div
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.52, delay: 0.4 + i * 0.06, ease: EASE_ENTER }}
    >
      {children}
    </motion.div>
  );
}

/** Hero side panel (the quick form) settles in as one block. */
export function HeroPanel({ children }: { children: ReactNode }) {
  return (
    <motion.div
      data-reveal=""
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.2, ease: EASE_ENTER }}
    >
      {children}
    </motion.div>
  );
}

const reveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (delay: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: EASE_ENTER } }),
};

/** Subtle one-time reveal for a section block as it enters the viewport. */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      data-reveal=""
      className={className}
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -10% 0px" }}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}
