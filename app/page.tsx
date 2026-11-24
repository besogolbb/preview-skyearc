import { notFound } from "next/navigation";

// The root deliberately shows nothing: previews are private links (/<slug>),
// and a public index would expose who SkyeArc is pitching.
export default function Home() {
  notFound();
}
