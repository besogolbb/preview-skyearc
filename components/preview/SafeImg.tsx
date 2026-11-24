"use client";

import { useEffect, useRef, useState } from "react";

type Src = { src: string; srcSet?: string; alt: string; width: number; height: number };

/**
 * <img> that never leaves a blank box: if the photo fails to load (bad path,
 * missing file, network error) it swaps once to the verified default
 * construction photo. Also catches errors that happened before hydration.
 */
export default function SafeImg({
  photo,
  fallback,
  sizes,
  loading = "eager",
}: {
  photo: Src;
  fallback: Src;
  sizes: string;
  loading?: "eager" | "lazy";
}) {
  const [cur, setCur] = useState<Src>(photo);
  const ref = useRef<HTMLImageElement>(null);

  const fail = () => setCur((c) => (c.src === fallback.src ? c : fallback));

  useEffect(() => {
    const img = ref.current;
    // Failed before React attached onError (e.g. during SSR hydration).
    if (img && img.complete && img.naturalWidth === 0) fail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={cur.src}
      srcSet={cur.srcSet}
      sizes={sizes}
      width={cur.width}
      height={cur.height}
      alt={cur.alt}
      loading={loading}
      decoding="async"
      onError={fail}
    />
  );
}
