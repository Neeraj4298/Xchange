/**
 * Studio-lit product photography & standardized category catalog
 * Matches the Ronas IT /Shop & B&O Beoplay H95 reference direction in ui_suggestion.docx
 */

export interface StudioCategory {
  slug: string;
  name: string;
  count: number;
  summary: string;
}

export const STANDARD_CATEGORIES: StudioCategory[] = [
  { slug: "cameras-lenses", name: "Electronics", count: 142, summary: "Cameras, audio, tablets & laptops" },
  { slug: "fashion", name: "Fashion", count: 64, summary: "Watches, sneakers & outerwear" },
  { slug: "home-furniture", name: "Home and Furniture", count: 51, summary: "Chairs, lamps & espresso gear" },
  { slug: "books-campus", name: "Books", count: 88, summary: "Design monographs & textbooks" },
  { slug: "cycles-mobility", name: "Sports and Fitness", count: 73, summary: "Cycles, rackets & outdoor gear" },
  { slug: "workstation-audio", name: "Appliances", count: 47, summary: "Monitors, keyboards & studio gear" },
  { slug: "musical-instruments", name: "Collectibles", count: 39, summary: "Guitars, synths & vinyl" },
  { slug: "gaming-consoles", name: "Other", count: 58, summary: "Consoles, board games & hobby kits" },
];

const STUDIO_PHOTOS: Record<string, string[]> = {
  "cameras-lenses": [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=85",
  ],
  "musical-instruments": [
    "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=85",
  ],
  "workstation-audio": [
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85",
  ],
  "gaming-consoles": [
    "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=85",
  ],
  "cycles-mobility": [
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=85",
  ],
};

export function getProductPhotoUrl(categorySlug: string, title = "", index = 0): string {
  const lower = title.toLowerCase();
  if (lower.includes("headphone") || lower.includes("wh-")) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85";
  }
  if (lower.includes("keyboard") || lower.includes("keychron")) {
    return "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85";
  }
  if (lower.includes("ipad") || lower.includes("macbook")) {
    return "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=85";
  }
  if (lower.includes("stratocaster") || lower.includes("guitar")) {
    return "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&w=900&q=85";
  }
  if (lower.includes("playstation") || lower.includes("ps5")) {
    return "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=85";
  }
  const bucket = STUDIO_PHOTOS[categorySlug] || STUDIO_PHOTOS["cameras-lenses"]!;
  return bucket[index % bucket.length]!;
}
