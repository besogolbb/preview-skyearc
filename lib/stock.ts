/**
 * Vetted trade stand-in photographs (Wikimedia Commons, free licences).
 * claude.md: never use a prospect's own project photos; every stand-in is
 * captioned as a sample. Files live in public/assets/<niche>/ (fetched from Wikimedia
 * Commons; full licence data in public/assets/credits.json).
 */
export type StockPhoto = {
  id: string;
  base: string; // "<niche folder>/<file stem>" under public/assets
  w: number;
  h: number;
  large: boolean; // has a 1280w file
  /** Full-bleed hero file (≥1600w) when one was fetched */
  hero?: { w: number; h: number };
  alt: string;
  by: string;
  licence: string;
  licenceUrl: string;
  page: string;
};

export const STOCK = {
  kitchen: {
    id: "f32731566",
    base: "remodeling/photo-f32731566",
    w: 1280,
    h: 962,
    large: true,
    hero: { w: 2200, h: 1650 },
    alt: "Renovated kitchen with white cabinets and dark benchtops, tools still on the counter",
    by: "Tomwsulcer",
    licence: "CC0",
    licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    page: "https://commons.wikimedia.org/wiki/File:Kitchen_renovation_project_mostly_finished_tools_still_on_counter.JPG",
  },
  bathroom: {
    id: "f91731451",
    base: "remodeling/photo-f91731451",
    w: 1280,
    h: 962,
    large: true,
    alt: "Tiled walk-in shower with blue glass tile band and twin shower heads",
    by: "andrechinn",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    page: "https://commons.wikimedia.org/wiki/File:Dual-head_shower_-_Flickr_-_andrechinn.jpg",
  },
  roofing: {
    id: "f137161354",
    base: "roofing/photo-f137161354",
    w: 960,
    h: 722,
    large: false,
    alt: "Aerial view of a single-storey house with a new standing-seam metal roof",
    by: "Wikideas1",
    licence: "CC0",
    licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    page: "https://commons.wikimedia.org/wiki/File:Standing_seam_metal_roof_low_pitch_roof-3.jpg",
  },
  plumbing: {
    id: "f31908153",
    base: "plumbing/photo-f31908153",
    w: 1280,
    h: 1000,
    large: true,
    hero: { w: 1665, h: 1302 },
    alt: "Hand fitting a new isolation valve with thread tape under a sink",
    by: "Tomwsulcer",
    licence: "CC0",
    licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    page: "https://commons.wikimedia.org/wiki/File:Kitchen_renovation_new_plumbing_valve_beneath_kitchen_sink_with_teflon_tape.JPG",
  },
  electrical: {
    id: "f76424255",
    base: "electrical/photo-f76424255",
    w: 1280,
    h: 719,
    large: true,
    alt: "Switchboard with circuit breakers and neatly run red and blue wiring",
    by: "Retired electrician",
    licence: "CC0",
    licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    page: "https://commons.wikimedia.org/wiki/File:%D0%9C%D0%BE%D0%B4%D1%83%D0%BB%D1%8C%D0%BD%D1%8B%D0%B5_%D0%B1%D0%BB%D0%BE%D0%BA%D0%B8_%D0%B7%D0%B0%D1%89%D0%B8%D1%82%D1%8B_%D1%80%D0%BE%D1%81%D1%81%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D1%85_%D0%B1%D1%80%D0%B5%D0%BD%D0%B4%D0%BE%D0%B2.jpg",
  },
  framing: {
    id: "f94379265",
    base: "carpentry/photo-f94379265",
    w: 1280,
    h: 719,
    large: true,
    hero: { w: 2200, h: 1238 },
    alt: "Two-storey timber house frame standing on a new slab",
    by: "L Maule",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    page: "https://commons.wikimedia.org/wiki/File:Timber_frame_house_under_construction,_New_Zealand.jpg",
  },
  deck: {
    id: "deck-ridunwig",
    base: "carpentry/photo-deck",
    w: 1280,
    h: 960,
    large: true,
    alt: "Timber verandah deck with new hardwood boards fitted among the painted ones",
    by: "Ridunwig",
    licence: "CC0",
    licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    page: "https://commons.wikimedia.org/wiki/File:Timber_Deck_Repairs.jpg",
  },
  pergola: {
    id: "pergola-mmda",
    base: "carpentry/photo-pergola",
    w: 1280,
    h: 960,
    large: true,
    alt: "White timber pergola rafters with shaped ends on a round column",
    by: "MMDA-Photos",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    page: "https://commons.wikimedia.org/wiki/File:MMDA-Photos_-_2008-06-01_-_Rye_Pool_House_Pergola_-2.jpg",
  },
  gate: {
    id: "gate-acabashi",
    base: "carpentry/photo-gate",
    w: 1280,
    h: 853,
    large: true,
    alt: "Braced timber farm gate hung on a square post with galvanised strap hinges",
    by: "Acabashi",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    page: "https://commons.wikimedia.org/wiki/File:Gate_to_Whitesbridge_Farm,_Sedgwick_Lane,_Nuthurst,_West_Sussex.jpg",
  },
  tile: {
    id: "tile-fgonzalez",
    base: "remodeling/photo-tile",
    w: 1280,
    h: 960,
    large: true,
    alt: "Hand bedding a new floor tile with a rubber float, tile spacers in the joints",
    by: "Francisco Gonzalez",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    page: "https://commons.wikimedia.org/wiki/File:Using_a_trowel_to_lay_floor_tiles.jpg",
  },
  driveway: {
    id: "driveway-panamitsu",
    base: "concrete/photo-driveway",
    w: 1280,
    h: 960,
    large: true,
    hero: { w: 2200, h: 1650 },
    alt: "Driveway formed up with steel reinforcing mesh on chairs, ready for the concrete pour",
    by: "Panamitsu",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    page: "https://commons.wikimedia.org/wiki/File:Driveway_concrete_reinforcement.jpg",
  },
  asphalt: {
    id: "asphalt-famartin",
    base: "concrete/photo-asphalt",
    w: 1280,
    h: 960,
    large: true,
    alt: "Close-up of fresh black asphalt on a newly paved driveway",
    by: "Famartin",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    page: "https://commons.wikimedia.org/wiki/File:2026-04-14_12_06_18_Fresh_asphalt_on_a_newly_paved_driveway_along_Windybush_Way_in_the_Mountainview_section_of_Ewing_Township,_Mercer_County,_New_Jersey.jpg",
  },
  sidewalk: {
    id: "sidewalk-mta",
    base: "concrete/photo-sidewalk",
    w: 1280,
    h: 960,
    large: true,
    alt: "Sidewalk formed with timber edges and rebar, crew preparing the concrete pour",
    by: "MTA Capital Construction Mega Projects",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    page: "https://commons.wikimedia.org/wiki/File:Pouring_concrete_for_a_newly_graded_sidewalk_at_the_northern_end_of_the_LIRR_concourse._06-25-2019_(48146739097).jpg",
  },
} satisfies Record<string, StockPhoto>;

export type StockKey = keyof typeof STOCK;

export function stockSrc(p: StockPhoto) {
  const src = `/assets/${p.base}-960.webp`;
  const srcSet = [`/assets/${p.base}-500.webp 500w`, `/assets/${p.base}-960.webp 960w`]
    .concat(p.large ? [`/assets/${p.base}.webp 1280w`] : [])
    .join(", ");
  return { src, srcSet };
}

/** srcset for a full-bleed hero: the regular sizes plus the large hero file. */
export function heroSrc(p: StockPhoto) {
  const base = stockSrc(p);
  if (!p.hero) return { ...base, src: p.large ? `/assets/${p.base}.webp` : base.src };
  return { src: `/assets/${p.base}-hero.webp`, srcSet: `${base.srcSet}, /assets/${p.base}-hero.webp ${p.hero.w}w` };
}

export const STAND_IN_LABEL = "Sample project photo — replaced with your real portfolio on launch.";

/**
 * Sample-photo sets per sub-niche. A preview's `assetFolder` picks one; each
 * service card without its own `photo` takes the next photo in the set, and the
 * hero takes the first. Files live in public/assets/<niche>/ (vetted, licensed).
 */
export const NICHES = {
  remodeling: ["kitchen", "bathroom", "tile"],
  carpentry: ["framing", "deck", "pergola"],
  roofing: ["roofing", "framing", "deck"],
  plumbing: ["plumbing", "bathroom", "kitchen"],
  electrical: ["electrical", "kitchen", "framing"],
  builders: ["framing", "kitchen", "deck"],
  concrete: ["driveway", "sidewalk", "asphalt"],
} satisfies Record<string, StockKey[]>;

export type NicheKey = keyof typeof NICHES;

/** Verified default construction photo: used whenever a photo key or file fails. */
export const DEFAULT_PHOTO: StockKey = "framing";
