import { z } from "zod";
import { computeMatchScore, type MatchFactors } from "./utilities";
import type { ItemCondition } from "./enums";
import type { MarketplaceItemDto } from "./phase1-dtos";

const CONDITION_RANK: Record<ItemCondition, number> = {
  new: 5,
  like_new: 4,
  good: 3,
  fair: 2,
  parts: 1,
};

/**
 * Computes the 5-factor Smart Matching score (0..100) between a user's item (itemA)
 * and a candidate target listing (itemB) per PRD Section 7 & System Design Section 9.1 (BE-2.1).
 */
export function evaluatePairFactors(
  itemA: MarketplaceItemDto,
  itemB: MarketplaceItemDto
): { factors: MatchFactors; score: number; reasons: string[] } {
  const reasons: string[] = [];

  // 1. I: Item preference compatibility (0..100)
  const bText = `${itemB.title} ${itemB.description} ${itemB.categoryName}`.toLowerCase();
  const matchedWants = itemA.wantsSummary.filter((w) =>
    w
      .toLowerCase()
      .split(/\s+/)
      .some((token) => token.length > 2 && bText.includes(token))
  );
  const itemPreference =
    matchedWants.length > 0 ? 96 : itemA.openToAnything ? 82 : 68;
  if (matchedWants.length > 0) {
    reasons.push(`Matches your want: "${matchedWants[0]}"`);
  }

  // 2. V: Value compatibility (100 within 10%, linear decay to 0 at 3x; cash lifts score)
  const midA = (itemA.estValueMinPaise + itemA.estValueMaxPaise) / 2;
  const midB = (itemB.estValueMinPaise + itemB.estValueMaxPaise) / 2;
  const ratio = Math.max(midA, midB) / Math.max(1, Math.min(midA, midB));
  let valueCompatibility = 100;
  if (ratio > 1.1) {
    valueCompatibility = Math.max(0, Math.round(100 * (1 - (ratio - 1.1) / 1.9)));
  }
  if (itemA.openToCash && itemB.openToCash && valueCompatibility < 95) {
    valueCompatibility = Math.min(98, valueCompatibility + 14);
    reasons.push("Peer cash balancer bridges value delta");
  } else if (ratio <= 1.15) {
    reasons.push("Value ranges align within ~10%");
  }

  // 3. L: Location proximity (100 within 3 km, 0 beyond maxDistanceM)
  const maxKm = Math.max(3.5, (itemA.maxDistanceM || 8000) / 1000);
  const dist = itemB.distanceKm;
  let locationProximity = 100;
  if (dist > 3) {
    locationProximity = Math.max(
      0,
      Math.round(100 * (1 - (dist - 3) / Math.max(1, maxKm - 3)))
    );
  }
  if (dist <= 3.5) {
    reasons.push(`Close proximity (${dist} km in Bengaluru cluster)`);
  }

  // 4. C: Condition compatibility
  const rankB = CONDITION_RANK[itemB.condition] ?? 3;
  const conditionCompatibility = rankB >= 4 ? 96 : rankB === 3 ? 86 : 70;

  // 5. P: User preferences
  const userPreferences = itemA.openToCash === itemB.openToCash ? 95 : 80;

  const factors: MatchFactors = {
    itemPreference,
    valueCompatibility,
    locationProximity,
    conditionCompatibility,
    userPreferences,
  };

  return {
    factors,
    score: computeMatchScore(factors),
    reasons,
  };
}

export const CreateSavedSearchSchema = z.object({
  query: z.string().min(2).max(100),
  categorySlug: z.string().default("all"),
  maxDistanceKm: z.number().min(1).max(50).default(8),
  notify: z.boolean().default(true),
});
export type CreateSavedSearchInput = z.infer<typeof CreateSavedSearchSchema>;

export const MatchFeedbackSchema = z.object({
  action: z.enum(["shown", "dismissed", "clicked", "offered"]),
});
export type MatchFeedbackInput = z.infer<typeof MatchFeedbackSchema>;

export interface MatchCandidateDto {
  id: string;
  myItem: MarketplaceItemDto;
  targetItem: MarketplaceItemDto;
  score: number;
  isMutualMatch: boolean;
  factors: MatchFactors;
  reasons: string[];
  shownCount: number;
  clicked: boolean;
  dismissed: boolean;
  convertedOfferId?: string | null;
  computedAt: string;
}

export interface SavedSearchDto {
  id: string;
  userId: string;
  query: string;
  categorySlug: string;
  maxDistanceKm: number;
  notify: boolean;
  matchingItemsCount: number;
  createdAt: string;
}

export interface MatchingTelemetryDto {
  totalCandidates: number;
  mutualMatchesCount: number;
  dismissedCount: number;
  clickedCount: number;
  totalOffersCount: number;
  matchOriginatedOffersCount: number;
  recommendationOfferSharePercent: number;
  phase2ExitGatePassed: boolean;
}
