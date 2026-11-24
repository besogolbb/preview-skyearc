/**
 * Which icon each homeowner pain point gets on the problem (bento) tiles.
 * The TITLE decides; the body is only used when the title matches nothing.
 * Shared by components/preview/icons.tsx and scripts/check-preview.mjs.
 * Never a generic "alert/!" icon: it reads as an error message.
 */
export type ProblemIconKey = "phoneMissed" | "priceTag" | "clockLate" | "uneven" | "mess";

export const PROBLEM_RULES: [RegExp, ProblemIconKey][] = [
  [/call|phone|respon|repl|message|ring\b/, "phoneMissed"],
  [/pric|cost|quote|estimate|bill|fee|surprise/, "priceTag"],
  [/time|late|delay|slip|schedule|wait|no-show/, "clockLate"],
  [/uneven|sloppy|finish|grout|crooked|quality/, "uneven"],
  [/mess|clean|site|dust|debris|offcut/, "mess"],
];

export function problemIconFor(title: string, body = ""): ProblemIconKey | null {
  for (const t of [title.toLowerCase(), body.toLowerCase()]) {
    const hit = PROBLEM_RULES.find(([re]) => re.test(t));
    if (hit) return hit[1];
  }
  return null;
}
