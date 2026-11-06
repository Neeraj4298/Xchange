import { createXchangeApiClient, type XchangeApiClient } from "@xchange/api-sdk";
import { tuneMatchingWeights, type MarketplaceItemDto } from "@xchange/shared";
import { FALLBACK_HEALTH, FALLBACK_SHOWCASE } from "./fallback-data";

export { FALLBACK_HEALTH, FALLBACK_SHOWCASE };

let inMemoryAccessToken: string | null = null;

export function setClientAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getClientAccessToken(): string | null {
  return inMemoryAccessToken;
}

const rawClient = createXchangeApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  getAccessToken: () => inMemoryAccessToken,
});

const FALLBACK_ITEMS: MarketplaceItemDto[] = FALLBACK_SHOWCASE.featuredItems.map((f, idx) => ({
  id: f.id,
  ownerId: `user-fallback-${idx + 1}`,
  ownerName: f.ownerName,
  ownerRating: f.ownerRating,
  ownerVerified: f.ownerVerified,
  title: f.title,
  description: `${f.title} — carefully maintained in ${f.neighbourhood}. Ready for local Bengaluru safe-point handover.`,
  categorySlug: f.categorySlug,
  categoryName: f.categoryName,
  condition: f.condition,
  estValueMinPaise: f.estValueMinPaise,
  estValueMaxPaise: f.estValueMaxPaise,
  valueConfidence: f.valueConfidence,
  neighbourhood: f.neighbourhood,
  locationLat: 12.97,
  locationLng: 77.64,
  distanceKm: f.distanceKm,
  status: "active",
  lockedByTradeId: null,
  wantsSummary: f.wantsSummary,
  openToCash: f.openToCash,
  openToAnything: false,
  maxDistanceM: 8000,
  matchScore: f.matchScore,
  imageGradient: f.imageGradient,
  badge: f.badge,
  savedByMe: idx === 0,
  publishedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
}));

export const apiClient: XchangeApiClient = Object.assign(
  Object.create(Object.getPrototypeOf(rawClient)),
  rawClient,
  {
    async getHealth() {
      try {
        return await rawClient.getHealth();
      } catch {
        return FALLBACK_HEALTH;
      }
    },
    async getShowcase() {
      try {
        return await rawClient.getShowcase();
      } catch {
        return FALLBACK_SHOWCASE;
      }
    },
    async getFeed(params?: Parameters<XchangeApiClient["getFeed"]>[0]) {
      try {
        return await rawClient.getFeed(params);
      } catch {
        return { items: FALLBACK_ITEMS, total: FALLBACK_ITEMS.length };
      }
    },
    async getMyItems() {
      try {
        return await rawClient.getMyItems();
      } catch {
        return { items: FALLBACK_ITEMS.slice(0, 2) };
      }
    },
    async getScaleOverview() {
      try {
        return await rawClient.getScaleOverview();
      } catch {
        return {
          locales: ["en-IN", "kn-IN", "hi-IN"],
          cities: FALLBACK_SHOWCASE.cities,
          fourWayChain: {
            id: "chain-4way-fallback",
            city: "Bengaluru",
            status: "accepted",
            minEdgeScore: 91,
            meetupHub: "Indiranagar Metro Safe Exchange Zone",
            nodes: [],
          },
          tunedWeights: tuneMatchingWeights(48, 32),
          businessListingsCreated: 6,
        };
      }
    },
  }
);
